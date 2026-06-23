import { DiscordSDK, Events } from "@discord/embedded-app-sdk";
import { io } from "socket.io-client";

import "./style.css";

let auth;
let socket;

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

// --------------------
// Game State
// --------------------
let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;
let winner = null;
let participants = [];
let players = [];
let spectators = [];
let playerSymbol = null;
let socketConnected = false;

function isGameReady() {
  return players.length === 2;
}

function displayName(participant) {
  return (
    participant.name ||
    participant.global_name ||
    participant.nickname ||
    participant.username ||
    "Player"
  );
}

// --------------------
// UI Rendering
// --------------------
function renderBoard() {
  const app = document.querySelector("#app");

  const gameReady = isGameReady();
  const isMyTurn = gameReady && playerSymbol === currentPlayer && !gameOver;

  let statusText = socketConnected
    ? `Waiting for another player (${players.length}/2)`
    : "Connecting to game server";

  if (winner === "X" || winner === "O") {
    statusText = `${winner} wins`;
  } else if (winner === "draw") {
    statusText = `Draw`;
  } else if (gameReady && playerSymbol) {
    statusText = isMyTurn
      ? `Your turn (${playerSymbol})`
      : `Turn: ${currentPlayer}`;
  } else if (gameReady) {
    statusText = `Spectating: ${currentPlayer}'s turn`;
  }

  app.innerHTML = `
    <div class="game">
      <h1>Tic Tac Toe</h1>
      <p>${statusText}</p>
      <p class="players">
        Players: ${
          players.length ? players.map(formatPlayer).join(" vs ") : "None yet"
        }
      </p>
      <p class="players">
        Activity: ${
          participants.length
            ? participants.slice(0, 6).map(displayName).join(", ")
            : "Only you so far"
        }
      </p>

      <div class="board">
        ${board
          .map(
            (cell, i) => `
            <button class="cell" data-index="${i}" ${
              isMyTurn && !cell ? "" : "disabled"
            }>
              ${cell ?? ""}
            </button>
          `
          )
          .join("")}
      </div>

      <button id="reset">Reset</button>
    </div>
  `;

  document.querySelectorAll(".cell").forEach((btn) => {
    btn.addEventListener("click", onCellClick);
  });

  document.querySelector("#reset").addEventListener("click", resetGame);
}

function formatPlayer(player) {
  return `${displayName(player)} (${player.symbol})`;
}

// --------------------
// Game Actions
// --------------------
function onCellClick(e) {
  const index = Number(e.target.dataset.index);

  if (!socket || !isGameReady() || board[index] || gameOver) return;

  socket.emit("makeMove", { index });
}

async function fetchAccessToken(code) {
  const tokenPaths = ["/.proxy/api/token", "/api/token"];

  for (const path of tokenPaths) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      return response.json();
    }
  }

  throw new Error("Failed to exchange Discord authorization code");
}

function updateParticipants(nextParticipants) {
  participants = nextParticipants;
  console.log("Activity participants updated", participants);
  renderBoard();
}

async function setupParticipantTracking() {
  const connected =
    await discordSdk.commands.getActivityInstanceConnectedParticipants();

  updateParticipants(connected.participants);

  await discordSdk.subscribe(
    Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE,
    ({ participants: updatedParticipants }) => {
      updateParticipants(updatedParticipants);
    }
  );
}

function resetGame() {
  socket?.emit("resetGame");
}

function getSocketPath() {
  return import.meta.env.DEV ? "/socket.io" : "/.proxy/socket.io";
}

function applyGameState(state) {
  board = state.board;
  currentPlayer = state.currentPlayer;
  gameOver = state.gameOver;
  winner = state.winner;
  players = state.players;
  spectators = state.spectators;
  playerSymbol =
    players.find((player) => player.id === auth.user.id)?.symbol || null;

  renderBoard();
}

function setupSocket() {
  socket = io({
    path: getSocketPath(),
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    socketConnected = true;
    socket.emit("joinGame", {
      roomId: discordSdk.instanceId || discordSdk.channelId,
      user: {
        id: auth.user.id,
        username: auth.user.username,
        name: auth.user.global_name || auth.user.username,
      },
    });
    renderBoard();
  });

  socket.on("disconnect", () => {
    socketConnected = false;
    renderBoard();
  });

  socket.on("gameState", applyGameState);
}

// --------------------
// Discord SDK Setup
// --------------------
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

  const { access_token } = await fetchAccessToken(code);

  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (!auth) {
    throw new Error("Authenticate command failed");
  }

  await setupParticipantTracking();
  setupSocket();
}

// --------------------
// Init
// --------------------
setupDiscordSdk().then(() => {
  console.log("Discord SDK authenticated");

  renderBoard();
});
