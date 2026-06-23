import io from 'socket.io-client'

let socket = null
let onRoomUpdate = null
let onInvalidMove = null
let onOpponentLeft = null
let onRoomFull = null

export function connectSocket(roomId, onConnectionChange) {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
  
  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Connected to server')
    onConnectionChange && onConnectionChange('connected')
    socket.emit('joinRoom', { roomId })
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from server')
    onConnectionChange && onConnectionChange('disconnected')
  })

  socket.on('roomFull', () => {
    console.log('Room is full')
    onRoomFull && onRoomFull()
  })

  socket.on('roomUpdate', (data) => {
    onRoomUpdate && onRoomUpdate(data)
  })

  socket.on('invalidMove', (data) => {
    console.log('Invalid move:', data.reason)
    onInvalidMove && onInvalidMove(data.reason)
  })

  socket.on('opponentLeft', () => {
    console.log('Opponent left the game')
    onOpponentLeft && onOpponentLeft()
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}

export function onRoomUpdateListener(callback) {
  onRoomUpdate = callback
}

export function onInvalidMoveListener(callback) {
  onInvalidMove = callback
}

export function onOpponentLeftListener(callback) {
  onOpponentLeft = callback
}

export function onRoomFullListener(callback) {
  onRoomFull = callback
}

export function makeMove(roomId, index) {
  if (socket) {
    socket.emit('makeMove', { roomId, index })
  }
}

export function requestRematch(roomId) {
  if (socket) {
    socket.emit('requestRematch', { roomId })
  }
}

export function leaveRoom(roomId) {
  if (socket) {
    socket.emit('leaveRoom', { roomId })
  }
}
