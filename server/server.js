import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;

// Allow express to parse JSON bodies
app.use(express.json());

// Store active game rooms
const gameRooms = new Map();

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
  res.send({access_token});
});

// Initialize or get game room
app.post("/api/game/room", (req, res) => {
  const { roomId } = req.body;
  
  if (!gameRooms.has(roomId)) {
    gameRooms.set(roomId, {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      players: { X: null, O: null },
      gameActive: false,
      winner: null,
    });
  }
  
  res.json(gameRooms.get(roomId));
});

// Update game state
app.post("/api/game/move", (req, res) => {
  const { roomId, index, player } = req.body;
  
  if (!gameRooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }
  
  const room = gameRooms.get(roomId);
  
  if (room.board[index] !== null || !room.gameActive) {
    return res.status(400).json({ error: "Invalid move" });
  }
  
  room.board[index] = player;
  
  // Check winner
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  
  for (let line of lines) {
    const [a, b, c] = line;
    if (room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]) {
      room.winner = room.board[a];
      room.gameActive = false;
      break;
    }
  }
  
  if (!room.winner && room.board.every(cell => cell !== null)) {
    room.gameActive = false;
  }
  
  if (!room.winner && room.gameActive) {
    room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
  }
  
  res.json(room);
});

// Reset game (rematch)
app.post("/api/game/reset", (req, res) => {
  const { roomId } = req.body;
  
  if (!gameRooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }
  
  const room = gameRooms.get(roomId);
  room.board = Array(9).fill(null);
  room.currentPlayer = 'X';
  room.gameActive = true;
  room.winner = null;
  
  res.json(room);
});

// Assign player to room
app.post("/api/game/join", (req, res) => {
  const { roomId, userId } = req.body;
  
  if (!gameRooms.has(roomId)) {
    gameRooms.set(roomId, {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      players: { X: null, O: null },
      gameActive: false,
      winner: null,
    });
  }
  
  const room = gameRooms.get(roomId);
  
  if (room.players.X === null) {
    room.players.X = userId;
  } else if (room.players.O === null && room.players.X !== userId) {
    room.players.O = userId;
  }
  
  res.json(room);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
