import { DiscordSDK } from "@discord/embedded-app-sdk";

import "./style.css";

let auth;

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

// --------------------
// Game State
// --------------------
let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;

// --------------------
// Win Logic
// --------------------
const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner() {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (!board.includes(null)) return "draw";

  return null;
}

// --------------------
// UI Rendering
// --------------------
function renderBoard() {
  const app = document.querySelector("#app");

  const result = checkWinner();

  let statusText = `Turn: ${currentPlayer}`;

  if (result === "X" || result === "O") {
    statusText = `${result} wins`;
  } else if (result === "draw") {
    statusText = `Draw`;
  }

  app.innerHTML = `
    <div class="game">
      <h1>Tic Tac Toe</h1>
      <p>${statusText}</p>

      <div class="board">
        ${board
          .map(
            (cell, i) => `
            <button class="cell" data-index="${i}">
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

// --------------------
// Game Actions
// --------------------
function onCellClick(e) {
  const index = Number(e.target.dataset.index);

  if (board[index] || gameOver) return;

  board[index] = currentPlayer;

  const result = checkWinner();

  if (result === "X" || result === "O" || result === "draw") {
    gameOver = true;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }

  renderBoard();
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  renderBoard();
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

  const response = await fetch("/.proxy/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const { access_token } = await response.json();

  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (!auth) {
    throw new Error("Authenticate command failed");
  }
}

// --------------------
// Init
// --------------------
setupDiscordSdk().then(() => {
  console.log("Discord SDK authenticated");

  renderBoard();
});