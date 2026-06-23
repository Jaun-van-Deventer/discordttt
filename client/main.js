import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";

let auth;
let currentUser;
let roomId;
let pollIntervalId;
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

// Game state
let gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  players: { X: null, O: null },
  gameActive: false,
  winner: null,
};

function generateRoomId() {
  return `${discordSdk.channelId}_${discordSdk.guildId || 'dm'}`;
}

async function gameRequest(path, body) {
  const response = await fetch(`/.proxy/api/game/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Game request failed: ${response.status}`);
  }

  return response.json();
}

function applyGameState(nextGameState) {
  gameState = nextGameState;
  updateUI();
}

async function refreshGameState() {
  if (!roomId) return;

  try {
    applyGameState(await gameRequest("room", { roomId }));
  } catch (error) {
    console.error("Failed to refresh game state", error);
  }
}

async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log("Discord SDK is ready");

  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify", "guilds"],
  });

  const response = await fetch("/.proxy/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const { access_token } = await response.json();

  auth = await discordSdk.commands.authenticate({ access_token });
  if (auth == null) throw new Error("Authenticate command failed");

  currentUser = auth.user;
  roomId = generateRoomId();
}

async function assignPlayer() {
  try {
    applyGameState(await gameRequest("join", { roomId, userId: currentUser.id }));
  } catch (error) {
    console.error("Failed to join game room", error);
  }
}

function isRoomLeader() {
  return gameState.players.X === currentUser.id;
}

function getCurrentPlayerSymbol() {
  if (gameState.players.X === currentUser.id) return 'X';
  if (gameState.players.O === currentUser.id) return 'O';
  return null;
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

async function startGame() {
  if (!isRoomLeader()) return;

  try {
    applyGameState(await gameRequest("reset", { roomId, userId: currentUser.id }));
  } catch (error) {
    console.error("Failed to start game", error);
  }
}

async function makeMove(index) {
  if (!gameState.gameActive) return;
  if (gameState.board[index] !== null) return;

  const playerSymbol = getCurrentPlayerSymbol();
  if (playerSymbol !== gameState.currentPlayer) return;

  try {
    applyGameState(await gameRequest("move", {
      roomId,
      index,
      player: playerSymbol,
      userId: currentUser.id,
    }));
  } catch (error) {
    console.error("Failed to make move", error);
  }
}

function rematch() {
  if (!isRoomLeader()) return;
  startGame();
}

function updateUI() {
  const playerSymbol = getCurrentPlayerSymbol();
  const isCurrentUsersTurn = gameState.currentPlayer === playerSymbol;
  const boardHasMoves = gameState.board.some((cell) => cell !== null);
  const gameFinished = Boolean(gameState.winner) || isBoardFull(gameState.board);

  // Update board
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    const value = gameState.board[index];
    cell.textContent = value || '';
    cell.className = 'cell';
    if (value === 'X') cell.classList.add('x');
    if (value === 'O') cell.classList.add('o');
    cell.disabled = !gameState.gameActive || !isCurrentUsersTurn || gameState.board[index] !== null;
  });

  // Update player info
  const player1Name = gameState.players.X
    ? `Player X (${gameState.players.X === currentUser.id ? 'You' : 'Opponent'})`
    : 'Waiting...';
  const player2Name = gameState.players.O
    ? `Player O (${gameState.players.O === currentUser.id ? 'You' : 'Opponent'})`
    : 'Waiting...';

  document.getElementById('player1-name').textContent = player1Name;
  document.getElementById('player2-name').textContent = player2Name;

  // Update player card active state
  const player1Card = document.getElementById('player1-info');
  const player2Card = document.getElementById('player2-info');

  player1Card.classList.remove('active', 'inactive');
  player2Card.classList.remove('active', 'inactive');

  if (gameState.gameActive) {
    if (gameState.currentPlayer === 'X') {
      player1Card.classList.add('active');
      player2Card.classList.add('inactive');
    } else {
      player1Card.classList.add('inactive');
      player2Card.classList.add('active');
    }
  }

  // Update game status
  const statusDiv = document.getElementById('game-status');
  if (!gameState.players.X || !gameState.players.O) {
    statusDiv.textContent = 'Waiting for players...';
  } else if (!gameState.gameActive && gameState.winner) {
    const winnerName = gameState.winner === 'X'
      ? (gameState.players.X === currentUser.id ? 'You won!' : 'Opponent won!')
      : (gameState.players.O === currentUser.id ? 'You won!' : 'Opponent won!');
    statusDiv.textContent = `${gameState.winner} ${winnerName}`;
  } else if (!gameState.gameActive && isBoardFull(gameState.board)) {
    statusDiv.textContent = "It's a draw!";
  } else if (gameState.gameActive) {
    const currentName = gameState.currentPlayer === 'X'
      ? (gameState.players.X === currentUser.id ? 'Your' : "Opponent's")
      : (gameState.players.O === currentUser.id ? 'Your' : "Opponent's");
    statusDiv.textContent = `${currentName} turn (${gameState.currentPlayer})`;
  } else {
    statusDiv.textContent = isRoomLeader() ? 'Ready to start.' : 'Waiting for room leader to start...';
  }

  // Update button visibility
  const startBtn = document.getElementById('start-btn');
  const rematchBtn = document.getElementById('rematch-btn');

  if (isRoomLeader() && !gameState.gameActive && gameState.players.X && gameState.players.O && !boardHasMoves && !gameState.winner) {
    startBtn.style.display = 'block';
  } else {
    startBtn.style.display = 'none';
  }

  if (isRoomLeader() && !gameState.gameActive && gameState.players.X && gameState.players.O && gameFinished) {
    rematchBtn.style.display = 'block';
  } else {
    rematchBtn.style.display = 'none';
  }

  // Update leader badge
  const leaderBadge = document.getElementById('leader-badge');
  if (isRoomLeader()) {
    leaderBadge.style.display = 'inline-block';
  } else {
    leaderBadge.style.display = 'none';
  }
}

// Event listeners
document.querySelectorAll('.cell').forEach((cell) => {
  cell.addEventListener('click', (e) => {
    const index = parseInt(e.target.dataset.index);
    makeMove(index);
  });
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('rematch-btn').addEventListener('click', rematch);

// Initialize
setupDiscordSdk().then(() => {
  console.log("Discord SDK authenticated", currentUser);
  assignPlayer();
  pollIntervalId = window.setInterval(refreshGameState, 1000);
  window.addEventListener("beforeunload", () => {
    window.clearInterval(pollIntervalId);
  });
});
