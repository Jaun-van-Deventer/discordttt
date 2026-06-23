import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { createServer } from "node:http";
import { Server } from "socket.io";
dotenv.config({ path: "../.env" });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const port = 3001;
const rooms = new Map();

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

function createRoom() {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    gameOver: false,
    winner: null,
    players: [],
    spectators: [],
  };
}

function resetRoomGame(room) {
  room.board = Array(9).fill(null);
  room.currentPlayer = "X";
  room.gameOver = false;
  room.winner = null;
}

function checkWinner(board) {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes(null) ? null : "draw";
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, createRoom());
  }

  return rooms.get(roomId);
}

function serializeRoom(room) {
  return {
    board: room.board,
    currentPlayer: room.currentPlayer,
    gameOver: room.gameOver,
    winner: room.winner,
    players: room.players.map(({ socketId, ...player }) => player),
    spectators: room.spectators.map(({ socketId, ...spectator }) => spectator),
    ready: room.players.length === 2,
  };
}

function emitRoomState(roomId) {
  const room = getRoom(roomId);
  io.to(roomId).emit("gameState", serializeRoom(room));
}

function removeSocketFromRoom(room, socketId) {
  const playerCountBefore = room.players.length;

  room.players = room.players.filter((player) => player.socketId !== socketId);
  room.spectators = room.spectators.filter(
    (spectator) => spectator.socketId !== socketId
  );

  if (room.players.length < 2 && playerCountBefore === 2) {
    resetRoomGame(room);
  }
}

function createGameRoom() {
  return {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    players: { X: null, O: null },
    gameActive: false,
    winner: null,
  };
}

app.post("/api/token", async (req, res) => {
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({ access_token });
});

io.on("connection", (socket) => {
  let activeRoomId = null;

  socket.on("joinGame", ({ roomId, user }) => {
    if (!roomId || !user?.id) return;

    activeRoomId = roomId;
    socket.join(roomId);

    const room = getRoom(roomId);
    removeSocketFromRoom(room, socket.id);

    const existingPlayer = room.players.find((player) => player.id === user.id);
    const existingSpectator = room.spectators.find(
      (spectator) => spectator.id === user.id
    );

    const participant = {
      id: user.id,
      name: user.name || user.username || "Player",
      socketId: socket.id,
    };

    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
      existingPlayer.name = participant.name;
    } else if (existingSpectator) {
      existingSpectator.socketId = socket.id;
      existingSpectator.name = participant.name;
    } else {
      if (room.players.length < 2) {
        room.players.push({
          ...participant,
          symbol: room.players.length === 0 ? "X" : "O",
        });
      } else {
        room.spectators.push(participant);
      }
    }

    emitRoomState(roomId);
  });

  socket.on("makeMove", ({ index }) => {
    if (!activeRoomId) return;

    const room = getRoom(activeRoomId);
    const player = room.players.find(({ socketId }) => socketId === socket.id);

    if (
      !player ||
      room.players.length < 2 ||
      room.gameOver ||
      player.symbol !== room.currentPlayer ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > 8 ||
      room.board[index]
    ) {
      return;
    }

    room.board[index] = player.symbol;
    const result = checkWinner(room.board);

    if (result) {
      room.gameOver = true;
      room.winner = result;
    } else {
      room.currentPlayer = room.currentPlayer === "X" ? "O" : "X";
    }

    emitRoomState(activeRoomId);
  });

  socket.on("resetGame", () => {
    if (!activeRoomId) return;

    const room = getRoom(activeRoomId);
    const isInRoom =
      room.players.some(({ socketId }) => socketId === socket.id) ||
      room.spectators.some(({ socketId }) => socketId === socket.id);

    if (!isInRoom) return;

    resetRoomGame(room);
    emitRoomState(activeRoomId);
  });

  socket.on("disconnect", () => {
    if (!activeRoomId) return;

    const room = getRoom(activeRoomId);
    removeSocketFromRoom(room, socket.id);

    if (room.players.length === 0 && room.spectators.length === 0) {
      rooms.delete(activeRoomId);
      return;
    }

    emitRoomState(activeRoomId);
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
