const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const games = {};

function createGame(roomId) {
  games[roomId] = {
    board: Array(9).fill(null),
    turn: "X"
  };
}

function checkWinner(board) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);

    if (!games[roomId]) createGame(roomId);

    socket.emit("state", games[roomId]);
  });

  socket.on("move", ({ roomId, index, player }) => {
    const game = games[roomId];
    if (!game) return;

    if (game.board[index] || game.turn !== player) return;

    game.board[index] = player;
    game.turn = player === "X" ? "O" : "X";

    const winner = checkWinner(game.board);

    io.to(roomId).emit("state", {
      ...game,
      winner
    });
  });
});

server.listen(PORT, () => console.log("Server running"));