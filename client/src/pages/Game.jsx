import { useState, useEffect } from 'react'
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  onRoomUpdateListener,
  onInvalidMoveListener,
  onOpponentLeftListener,
  onRoomFullListener,
  makeMove,
  requestRematch,
  leaveRoom,
} from '../utils/socket'

export default function Game({ roomId, user, onLeaveGame, onConnectionChange }) {
  const [roomState, setRoomState] = useState(null)
  const [playerSymbol, setPlayerSymbol] = useState(null)
  const [roomFull, setRoomFull] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Register all event listeners first, then connect the socket.
    // This prevents the race condition where 'roomUpdate' arrives before
    // the listener is registered and gets silently dropped.
    onRoomUpdateListener((data) => {
      setRoomState(data)

      // Determine player symbol from the updated player list
      if (data.players[0]?.socketId === getSocket()?.id) {
        setPlayerSymbol('X')
      } else if (data.players[1]?.socketId === getSocket()?.id) {
        setPlayerSymbol('O')
      }
    })

    onInvalidMoveListener((reason) => {
      setErrorMsg(reason)
      setTimeout(() => setErrorMsg(''), 3000)
    })

    onOpponentLeftListener(() => {
      setOpponentLeft(true)
    })

    onRoomFullListener(() => {
      setRoomFull(true)
    })

    // Connect only after all listeners are registered
    connectSocket(roomId, onConnectionChange)

    return () => {
      disconnectSocket()
    }
  }, [roomId, onConnectionChange])

  // Derive the game status message at render time to avoid stale closures
  function getGameStatus() {
    if (opponentLeft) return 'Opponent left the game'
    if (roomFull) return 'Room is full'
    if (!roomState) return 'Joining game...'
    if (roomState.gameStatus === 'waiting') return 'Waiting for opponent...'
    if (roomState.gameStatus === 'playing') {
      return roomState.currentTurn === playerSymbol ? 'Your turn' : "Opponent's turn"
    }
    if (roomState.gameStatus === 'ended') {
      if (roomState.winner === playerSymbol) return 'You won!'
      if (roomState.winner === null) return "It's a draw!"
      return 'You lost!'
    }
    return ''
  }

  function handleCellClick(index) {
    if (roomFull || opponentLeft || !roomState || !playerSymbol) return
    if (roomState.gameStatus !== 'playing') return
    if (roomState.currentTurn !== playerSymbol) return
    if (roomState.board[index] !== null) return

    makeMove(roomId, index)
  }

  function handlePlayAgain() {
    requestRematch(roomId)
  }

  function handleLeave() {
    leaveRoom(roomId)
    onLeaveGame()
  }

  if (roomFull) {
    return (
      <div className="page game-page">
        <div className="container">
          <h2>Room is Full</h2>
          <p>This room already has 2 players. Please try joining a different room.</p>
          <button className="btn btn-primary" onClick={handleLeave}>
            Leave
          </button>
        </div>
      </div>
    )
  }

  if (!roomState) {
    return (
      <div className="page game-page">
        <div className="container">
          <h2>Joining game...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  const gameStatus = getGameStatus()
  const canMove = !opponentLeft && playerSymbol === roomState.currentTurn && roomState.gameStatus === 'playing'
  const gameEnded = roomState.gameStatus === 'ended'

  return (
    <div className="page game-page">
      <div className="container">
        <h1>Tic Tac Toe</h1>

        <div className="game-info">
          <div className="player-info">
            <span className="symbol">You are: <strong>{playerSymbol}</strong></span>
          </div>
          <div className="players-count">
            Players: {roomState.players.length}/2
          </div>
        </div>

        <div className={`game-status ${gameEnded ? 'ended' : ''}`}>
          {gameStatus}
        </div>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <div className="board">
          {roomState.board.map((cell, index) => (
            <button
              key={index}
              className={`cell ${cell ? `cell-${cell}` : ''} ${canMove && cell === null ? 'clickable' : ''}`}
              onClick={() => handleCellClick(index)}
              disabled={!canMove || cell !== null || opponentLeft}
            >
              {cell}
            </button>
          ))}
        </div>

        {opponentLeft && (
          <div className="opponent-left">
            <p>Your opponent has left the game.</p>
            <button className="btn btn-secondary" onClick={handleLeave}>
              Leave Game
            </button>
          </div>
        )}

        {gameEnded && !opponentLeft && (
          <div className="game-actions">
            <button 
              className="btn btn-primary" 
              onClick={handlePlayAgain}
              disabled={roomState.rematchVotes?.[playerSymbol] === true}
            >
              {roomState.rematchVotes?.[playerSymbol] === true ? 'Waiting for opponent...' : 'Play Again'}
            </button>
            <button className="btn btn-secondary" onClick={handleLeave}>
              Leave Game
            </button>
          </div>
        )}

        {!gameEnded && (
          <button className="btn btn-secondary" onClick={handleLeave}>
            Leave Game
          </button>
        )}
      </div>
    </div>
  )
}
