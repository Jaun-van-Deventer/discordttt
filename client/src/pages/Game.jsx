import { useState, useEffect } from 'react'
import {
  getSocket,
  onRoomUpdateListener,
  onInvalidMoveListener,
  onOpponentLeftListener,
  onRoomFullListener,
  makeMove,
  requestRematch,
  leaveRoom,
} from '../utils/socket'

export default function Game({ roomId, user, onLeaveGame }) {
  const [roomState, setRoomState] = useState(null)
  const [playerSymbol, setPlayerSymbol] = useState(null)
  const [gameStatus, setGameStatus] = useState('Joining game...')
  const [roomFull, setRoomFull] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Set up socket event listeners
    onRoomUpdateListener((data) => {
      setRoomState(data)
      
      // Determine player symbol
      if (data.players[0]?.socketId === getSocket()?.id) {
        setPlayerSymbol('X')
      } else if (data.players[1]?.socketId === getSocket()?.id) {
        setPlayerSymbol('O')
      }

      // Update game status message
      updateGameStatus(data)
    })

    onInvalidMoveListener((reason) => {
      setErrorMsg(reason)
      setTimeout(() => setErrorMsg(''), 3000)
    })

    onOpponentLeftListener(() => {
      setOpponentLeft(true)
      setGameStatus('Opponent left the game')
    })

    onRoomFullListener(() => {
      setRoomFull(true)
      setGameStatus('Room is full')
    })

    return () => {
      // Cleanup is handled by disconnect
    }
  }, [])

  function updateGameStatus(data) {
    if (data.gameStatus === 'waiting') {
      setGameStatus('Waiting for opponent...')
    } else if (data.gameStatus === 'playing') {
      if (data.currentTurn === playerSymbol) {
        setGameStatus('Your turn')
      } else {
        setGameStatus("Opponent's turn")
      }
    } else if (data.gameStatus === 'ended') {
      if (data.winner === playerSymbol) {
        setGameStatus('You won!')
      } else if (data.winner === null) {
        setGameStatus("It's a draw!")
      } else {
        setGameStatus('You lost!')
      }
    }
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
