import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://*.discords.com",
      "https://discord.com",
      "https://*.discord.gg",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

const port = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(cors())

// Store game rooms
const gameRooms = new Map()

// Winning combinations
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

// Helper Functions
function createRoom(roomId) {
  return {
    roomId,
    players: [],
    board: Array(9).fill(null),
    currentTurn: 'X',
    gameStatus: 'waiting', // waiting, playing, ended
    winner: null,
    rematchVotes: {},
    startingPlayer: 'X',
  }
}

function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

function isBoardFull(board) {
  return board.every((cell) => cell !== null)
}

function broadcastRoomUpdate(roomId) {
  const room = gameRooms.get(roomId)
  if (!room) return

  const publicState = {
    roomId,
    players: room.players.map((p) => ({
      socketId: p.socketId,
      symbol: p.symbol,
    })),
    board: room.board,
    currentTurn: room.currentTurn,
    gameStatus: room.gameStatus,
    winner: room.winner,
    rematchVotes: room.rematchVotes,
  }

  io.to(roomId).emit('roomUpdate', publicState)
}

function cleanupEmptyRoom(roomId) {
  const room = gameRooms.get(roomId)
  if (room && room.players.length === 0) {
    gameRooms.delete(roomId)
    console.log(`Room ${roomId} cleaned up`)
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Tic Tac Toe backend running')
})

app.post('/api/token', async (req, res) => {
  const { code } = req.body
  
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
    }),
  })

  const data = await response.json()
  res.json({ access_token: data.access_token })
})

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('joinRoom', (data) => {
    const { roomId } = data

    // Get or create room
    let room = gameRooms.get(roomId)
    if (!room) {
      room = createRoom(roomId)
      gameRooms.set(roomId, room)
    }

    // Check if this socket is already in the room (e.g. duplicate joinRoom
    // emitted on reconnect). If so, just broadcast the current state.
    const alreadyJoined = room.players.some((p) => p.socketId === socket.id)
    if (alreadyJoined) {
      broadcastRoomUpdate(roomId)
      return
    }

    // Check if room is full
    if (room.players.length >= 2) {
      socket.emit('roomFull')
      console.log(`User ${socket.id} tried to join full room ${roomId}`)
      return
    }

    // Add player to room
    const symbol = room.players.length === 0 ? 'X' : 'O'
    room.players.push({
      socketId: socket.id,
      symbol,
    })

    // Join socket to room
    socket.join(roomId)
    socket.data.roomId = roomId
    socket.data.symbol = symbol

    console.log(`User ${socket.id} joined room ${roomId} as ${symbol}`)

    // If 2 players, start game
    if (room.players.length === 2) {
      room.gameStatus = 'playing'
      room.currentTurn = 'X'
      room.rematchVotes = {}
      console.log(`Game started in room ${roomId}`)
    }

    // Broadcast room update
    broadcastRoomUpdate(roomId)
  })

  socket.on('makeMove', (data) => {
    const { roomId, index } = data
    const room = gameRooms.get(roomId)

    if (!room) {
      socket.emit('invalidMove', { reason: 'Room not found' })
      return
    }

    // Validate move
    if (room.gameStatus !== 'playing') {
      socket.emit('invalidMove', { reason: 'Game is not active' })
      return
    }

    if (room.currentTurn !== socket.data.symbol) {
      socket.emit('invalidMove', { reason: 'Not your turn' })
      return
    }

    if (index < 0 || index > 8) {
      socket.emit('invalidMove', { reason: 'Invalid cell index' })
      return
    }

    if (room.board[index] !== null) {
      socket.emit('invalidMove', { reason: 'Cell already occupied' })
      return
    }

    // Make the move
    room.board[index] = socket.data.symbol

    // Check for winner
    const winner = checkWinner(room.board)
    if (winner) {
      room.gameStatus = 'ended'
      room.winner = winner
      console.log(`Game ended in room ${roomId}. Winner: ${winner}`)
    }
    // Check for draw
    else if (isBoardFull(room.board)) {
      room.gameStatus = 'ended'
      room.winner = null
      console.log(`Game ended in room ${roomId}. Draw!`)
    }
    // Switch turn
    else {
      room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X'
    }

    broadcastRoomUpdate(roomId)
  })

  socket.on('requestRematch', (data) => {
    const { roomId } = data
    const room = gameRooms.get(roomId)

    if (!room) return

    // Record rematch vote
    room.rematchVotes[socket.data.symbol] = true

    // If both players voted, start new game
    if (
      room.rematchVotes['X'] === true &&
      room.rematchVotes['O'] === true
    ) {
      // Alternate starting player
      room.startingPlayer = room.startingPlayer === 'X' ? 'O' : 'X'
      room.currentTurn = room.startingPlayer
      room.board = Array(9).fill(null)
      room.gameStatus = 'playing'
      room.winner = null
      room.rematchVotes = {}
      console.log(`Rematch started in room ${roomId}`)
    }

    broadcastRoomUpdate(roomId)
  })

  socket.on('leaveRoom', (data) => {
    const { roomId } = data
    const room = gameRooms.get(roomId)

    if (!room) return

    // Remove player
    room.players = room.players.filter((p) => p.socketId !== socket.id)

    socket.leave(roomId)

    // Notify remaining player
    if (room.players.length > 0) {
      io.to(roomId).emit('opponentLeft')
      console.log(`Player ${socket.id} left room ${roomId}`)
    }

    // Cleanup empty room
    cleanupEmptyRoom(roomId)

    broadcastRoomUpdate(roomId)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)

    // If player was in a room, remove them
    if (socket.data.roomId) {
      const room = gameRooms.get(socket.data.roomId)
      if (room) {
        room.players = room.players.filter((p) => p.socketId !== socket.id)

        if (room.players.length > 0) {
          io.to(socket.data.roomId).emit('opponentLeft')
        }

        cleanupEmptyRoom(socket.data.roomId)
      }
    }
  })
})

// Start server
httpServer.listen(port, () => {
  console.log(`Tic Tac Toe server listening on port ${port}`)
})
