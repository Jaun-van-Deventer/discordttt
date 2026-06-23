// This file is deprecated. The application now uses React.
// See src/main.jsx for the new entry point.
// This file is kept for reference only and is no longer used.


  updateUI();
}

function makeMove(index) {
  if (!gameState.gameActive) return;
  if (gameState.board[index] !== null) return;

  const playerSymbol = getCurrentPlayerSymbol();
  if (playerSymbol !== gameState.currentPlayer) return;

  gameState.board[index] = gameState.currentPlayer;

  const winner = checkWinner(gameState.board);
  if (winner) {
    gameState.winner = winner;
    gameState.gameActive = false;
  } else if (isBoardFull(gameState.board)) {
    gameState.gameActive = false;
  } else {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
  }

  updateUI();
}

function rematch() {
  if (!isRoomLeader()) return;
  startGame();
}

function updateUI() {
  // Update board
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    const value = gameState.board[index];
    cell.textContent = value || '';
    cell.className = 'cell';
    if (value === 'X') cell.classList.add('x');
    if (value === 'O') cell.classList.add('o');
    cell.disabled = !gameState.gameActive || gameState.board[index] !== null;
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
  }

  // Update button visibility
  const startBtn = document.getElementById('start-btn');
  const rematchBtn = document.getElementById('rematch-btn');

  if (isRoomLeader() && !gameState.gameActive && (!gameState.players.X || !gameState.players.O)) {
    startBtn.style.display = 'block';
  } else {
    startBtn.style.display = 'none';
  }

  if (isRoomLeader() && !gameState.gameActive && gameState.players.X && gameState.players.O) {
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
  updateUI();
});
