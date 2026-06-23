import io from 'socket.io-client'

let socket = null
let onRoomUpdate = null
let onInvalidMove = null
let onOpponentLeft = null
let onRoomFull = null
let onConnectError = null

export function connectSocket(roomId, onConnectionChange) {
  // Disconnect any existing socket before creating a new one to avoid
  // orphaned connections and module-level variable confusion.
  if (socket) {
    socket.disconnect()
    socket = null
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
  
  // Capture the socket in a local variable so that every event handler
  // always references THIS socket instance, not whatever socket happens
  // to be in the module-level variable at the time the event fires.
  // Without this, React Strict Mode's double-invocation of effects can
  // set socket = null (or a new socket) before the first socket's
  // 'connect' event fires, causing null.emit() and a dropped joinRoom.
  const localSocket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })
  socket = localSocket

  localSocket.on('connect', () => {
    console.log('Connected to server')
    onConnectionChange && onConnectionChange('connected')
    localSocket.emit('joinRoom', { roomId })
  })

  localSocket.on('disconnect', () => {
    console.log('Disconnected from server')
    onConnectionChange && onConnectionChange('disconnected')
  })

  localSocket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message)
    onConnectionChange && onConnectionChange('error')
    onConnectError && onConnectError(error.message)
  })

  localSocket.on('roomFull', () => {
    console.log('Room is full')
    onRoomFull && onRoomFull()
  })

  localSocket.on('roomUpdate', (data) => {
    onRoomUpdate && onRoomUpdate(data)
  })

  localSocket.on('invalidMove', (data) => {
    console.log('Invalid move:', data.reason)
    onInvalidMove && onInvalidMove(data.reason)
  })

  localSocket.on('opponentLeft', () => {
    console.log('Opponent left the game')
    onOpponentLeft && onOpponentLeft()
  })

  localSocket.on('error', (error) => {
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

export function onConnectErrorListener(callback) {
  onConnectError = callback
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
