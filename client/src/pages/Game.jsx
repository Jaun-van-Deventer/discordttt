import { useState, useEffect } from 'react'
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  onRoomUpdateListener,
  onInvalidMoveListener,
  onOpponentLeftListener,
  onRoomFullListener,
  onConnectErrorListener,
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
  const [connectError, setConnectError] = useState(false)

  useEffect(() => {
    onRoomUpdateListener((data) => {
      setRoomState(data)
      if (data.players.length === 2) {
        setOpponentLeft(false)
      }
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

    onConnectErrorListener(() => {
      setConnectError(true)
    })

    connectSocket(roomId, onConnectionChange)

    return () => {
      disconnectSocket()
    }
  }, [roomId, onConnectionChange])

  function getGameStatus() {
    if (opponentLeft) return '😢 Opponent left the game'
    if (roomFull) return 'Room is full'
    if (!roomState) return 'Joining game...'
    if (roomState.gameStatus === 'waiting') return 'Waiting for opponent...'
    if (roomState.gameStatus === 'playing') {
      return roomState.currentTurn === playerSymbol ? '⚡ Your turn!' : "⏳ Opponent's turn…"
    }
    if (roomState.gameStatus === 'ended') {
      if (roomState.winner === playerSymbol) return '🏆 You win!'
      if (roomState.winner === null) return "🤝 It's a draw!"
      return '😞 You lost…'
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

  // ── Early-exit: room full ──
  if (roomFull) {
    return (
      <div className="themed-page game-page">
        <div className="bg-deco" aria-hidden="true" />
        <div className="overlay-screen card" style={{ maxWidth: 460 }}>
          <div className="overlay-icon">🚫</div>
          <h2 className="overlay-title">Room Full</h2>
          <p className="overlay-msg">This room already has 2 players. Please try joining a different room.</p>
          <button className="btn btn-pink" onClick={handleLeave}>← Go Back</button>
        </div>
      </div>
    )
  }

  // ── Early-exit: connect error ──
  if (connectError) {
    return (
      <div className="themed-page game-page">
        <div className="bg-deco" aria-hidden="true" />
        <div className="overlay-screen card" style={{ maxWidth: 460 }}>
          <div className="overlay-icon">⚠️</div>
          <h2 className="overlay-title">Connection Failed</h2>
          <p className="overlay-msg">Could not connect to the game server. Please check your connection and try again.</p>
          <button className="btn btn-pink" onClick={handleLeave}>← Go Back</button>
        </div>
      </div>
    )
  }

  // ── Early-exit: loading ──
  if (!roomState) {
    return (
      <div className="themed-page game-page">
        <div className="bg-deco" aria-hidden="true" />
        <div className="overlay-screen">
          <h1 className="game-title">
            <span className="title-tic">TIC</span>{' '}
            <span className="title-tac">TAC</span>{' '}
            <span className="title-toe">TOE</span>
            {' '}<span className="title-crown">👑</span>
          </h1>
          <div className="status-pill">
            <span className="spinner" /> Joining game…
          </div>
        </div>
      </div>
    )
  }

  const gameStatus = getGameStatus()
  const canMove = !opponentLeft && playerSymbol === roomState.currentTurn && roomState.gameStatus === 'playing'
  const gameEnded = roomState.gameStatus === 'ended'

  const statusClass =
    roomState.winner === playerSymbol                              ? 'win'      :
    roomState.winner !== null && roomState.winner !== playerSymbol ? 'lose'     :
    roomState.winner === null && gameEnded                         ? 'draw'     :
    roomState.currentTurn === playerSymbol                         ? 'your-turn' : ''

  return (
    <div className="themed-page game-page">
      {/* Background */}
      <div className="bg-deco" aria-hidden="true" />

      {/* Scattered stars */}
      <span className="star-scatter" style={{ top:'7%',  left:'20%', animationDelay:'0s'   }}>✦</span>
      <span className="star-scatter" style={{ top:'13%', left:'72%', animationDelay:'0.7s' }}>✧</span>
      <span className="star-scatter" style={{ top:'55%', left:'8%',  animationDelay:'1.4s' }}>✦</span>
      <span className="star-scatter" style={{ top:'60%', left:'82%', animationDelay:'0.4s' }}>✧</span>
      <span className="star-scatter" style={{ bottom:'18%', left:'55%', animationDelay:'2s' }}>✦</span>

      {/* Deco */}
      <span className="deco-item" style={{ top:'5%',  left:'6%',  fontSize:'1rem',  color:'rgba(255,255,255,0.4)', transform:'rotate(-20deg)' }}>→</span>
      <span className="deco-item" style={{ top:'8%',  right:'7%', fontSize:'0.9rem', color:'rgba(200,180,255,0.5)' }}>XO</span>
      <span className="deco-item" style={{ top:'42%', right:'5%', fontSize:'1.5rem', color:'rgba(255,255,255,0.25)', transform:'rotate(-8deg)' }}>⚡</span>
      <span className="deco-item" style={{ top:'65%', right:'7%', fontSize:'1.2rem', color:'rgba(255,255,255,0.35)', transform:'rotate(15deg)' }}>✏️</span>
      <span className="deco-item" style={{ bottom:'14%', left:'8%', fontSize:'1.2rem', color:'rgba(255,230,100,0.55)' }}>⭐</span>
      <span className="deco-item" style={{ bottom:'10%', right:'8%', fontSize:'1rem', color:'rgba(100,220,255,0.6)' }}>⭐</span>

      {/* Let's play bubble */}
      <div className="lets-play-bubble" aria-hidden="true">LET'S<br/>PLAY!</div>

      {/* X mascot */}
      <div className="mascot mascot-x" aria-hidden="true">
        <img src="/images/x-mascot.png" alt=""
          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block' }} />
        <span className="mascot-fallback" style={{ display:'none' }}>✖️</span>
      </div>

      {/* O mascot */}
      <div className="mascot mascot-o" aria-hidden="true">
        <img src="/images/o-mascot.png" alt=""
          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block' }} />
        <span className="mascot-fallback" style={{ display:'none' }}>⭕</span>
      </div>

      {/* ── Centred game shell ── */}
      <div className="content-shell">

        {/* Title */}
        <h1 className="game-title">
          <span className="title-tic">TIC</span>{' '}
          <span className="title-tac">TAC</span>{' '}
          <span className="title-toe">TOE</span>
          {' '}<span className="title-crown">👑</span>
        </h1>

        {/* Info bar */}
        <div className="card game-info-bar">
          <div className="info-item">
            You are:&nbsp;
            <span className={`info-val ${playerSymbol === 'X' ? 'marker-x' : 'marker-o'}`}>
              {playerSymbol === 'X' ? '✖' : playerSymbol === 'O' ? '●' : '…'}
            </span>
          </div>
          <div className="info-item">
            Players:&nbsp;
            <span className="info-val" style={{ color: roomState.players.length === 2 ? '#5effa0' : '#ffe77a' }}>
              {roomState.players.length}/2
            </span>
          </div>
        </div>

        {/* Status pill */}
        <div className={`status-pill ${statusClass}`} role="status">
          {gameStatus}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="status-pill" style={{ borderColor:'#ff6eb3', color:'#ff6eb3', background:'rgba(80,0,30,0.7)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Board */}
        <div className="board-wrapper">
          <div className="board-grid" role="grid" aria-label="Tic Tac Toe Board">
            {roomState.board.map((cell, index) => (
              <button
                key={index}
                className={[
                  'cell',
                  cell ? 'taken' : '',
                  (!canMove || cell !== null || opponentLeft) ? 'disabled' : '',
                  cell === 'X' ? 'cell-x' : '',
                  cell === 'O' ? 'cell-o' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleCellClick(index)}
                disabled={!canMove || cell !== null || opponentLeft}
                aria-label={cell ? `${cell} in cell ${index + 1}` : `Empty cell ${index + 1}`}
                role="gridcell"
              >
                {cell === 'X' ? '✖' : cell === 'O' ? '●' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="actions-row">
          {opponentLeft && (
            <div className="status-pill" style={{ borderColor:'#ff6eb3', color:'#ff6eb3' }}>
              😢 Your opponent has left the game.
            </div>
          )}

          {gameEnded && !opponentLeft && (
            <button
              className="btn btn-yellow btn-play-again"
              onClick={handlePlayAgain}
              disabled={roomState.rematchVotes?.[playerSymbol] === true}
            >
              {roomState.rematchVotes?.[playerSymbol] === true
                ? <><span className="spinner" /> Waiting for opponent…</>
                : '🔄 Play Again'}
            </button>
          )}

          <button className="btn btn-pink" onClick={handleLeave}>
            Leave Game
          </button>
        </div>

      </div>
    </div>
  )
}
