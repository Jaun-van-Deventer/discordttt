// src/components/Game.jsx
// Tic Tac Toe — Discord Activity | Game Page
// ─────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
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
} from '../socket';   // adjust path if needed

/**
 * Props (unchanged from original):
 *  roomId  {string}
 *  onLeave {function}
 */
export default function Game({ roomId, onLeave }) {
  const [board,          setBoard]          = useState(Array(9).fill(null));
  const [mySymbol,       setMySymbol]       = useState(null);
  const [currentTurn,    setCurrentTurn]    = useState('X');
  const [playerCount,    setPlayerCount]    = useState(1);
  const [gameOver,       setGameOver]       = useState(false);
  const [winner,         setWinner]         = useState(null);  // 'X' | 'O' | 'draw'
  const [opponentLeft,   setOpponentLeft]   = useState(false);
  const [roomFull,       setRoomFull]       = useState(false);
  const [connectError,   setConnectError]   = useState(false);
  const [errorMessage,   setErrorMessage]   = useState('');
  const [rematchPending, setRematchPending] = useState(false);

  /* ── Socket setup ── */
  useEffect(() => {
    connectSocket(roomId);

    onRoomUpdateListener((data) => {
      setBoard(data.board ?? Array(9).fill(null));
      setMySymbol(data.mySymbol ?? null);
      setCurrentTurn(data.currentTurn ?? 'X');
      setPlayerCount(data.playerCount ?? 1);
      setGameOver(data.gameOver ?? false);
      setWinner(data.winner ?? null);
      setOpponentLeft(false);
      setErrorMessage('');
      if (data.gameOver) setRematchPending(false);
    });

    onInvalidMoveListener((msg) => {
      setErrorMessage(msg || 'Invalid move!');
    });

    onOpponentLeftListener(() => {
      setOpponentLeft(true);
      setGameOver(true);
    });

    onRoomFullListener(() => {
      setRoomFull(true);
    });

    onConnectErrorListener(() => {
      setConnectError(true);
    });

    return () => {
      disconnectSocket();
    };
  }, [roomId]);

  /* ── Handlers ── */
  const handleCellClick = useCallback((index) => {
    if (gameOver)              return;
    if (board[index])          return;
    if (currentTurn !== mySymbol) return;
    if (playerCount < 2)       return;
    makeMove(index);
    setErrorMessage('');
  }, [gameOver, board, currentTurn, mySymbol, playerCount]);

  const handlePlayAgain = () => {
    setRematchPending(true);
    requestRematch();
  };

  const handleLeave = () => {
    leaveRoom();
    disconnectSocket();
    if (onLeave) onLeave();
  };

  /* ── Derived UI state ── */
  const isMyTurn = !gameOver && currentTurn === mySymbol && playerCount === 2;

  const statusText = (() => {
    if (opponentLeft)              return '😢 Opponent left the game';
    if (winner === 'draw')         return "🤝 It's a draw!";
    if (winner && winner === mySymbol)  return '🏆 You win!';
    if (winner && winner !== mySymbol)  return '😞 You lose…';
    if (playerCount < 2)           return 'Waiting for opponent…';
    if (isMyTurn)                  return '⚡ Your turn!';
    return "⏳ Opponent's turn…";
  })();

  const statusClass = (() => {
    if (winner === mySymbol)  return 'win';
    if (winner && winner !== mySymbol) return 'lose';
    if (winner === 'draw')    return 'draw';
    if (isMyTurn)             return 'your-turn';
    return '';
  })();

  /* ── Early-exit screens ── */
  if (connectError) {
    return (
      <div className="themed-page game-page">
        <div className="bg-deco" aria-hidden="true" />
        <div className="overlay-screen card" style={{ maxWidth:460 }}>
          <div className="overlay-icon">⚠️</div>
          <h2 className="overlay-title">Connection Error</h2>
          <p className="overlay-msg">Could not connect to the game server. Please close and reopen the activity.</p>
          <button className="btn btn-pink" onClick={handleLeave}>← Go Back</button>
        </div>
      </div>
    );
  }

  if (roomFull) {
    return (
      <div className="themed-page game-page">
        <div className="bg-deco" aria-hidden="true" />
        <div className="overlay-screen card" style={{ maxWidth:460 }}>
          <div className="overlay-icon">🚫</div>
          <h2 className="overlay-title">Room Full</h2>
          <p className="overlay-msg">This room already has 2 players. Please start a new game.</p>
          <button className="btn btn-pink" onClick={handleLeave}>← Go Back</button>
        </div>
      </div>
    );
  }

  /* ── Main game screen ── */
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
          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block'; }} />
        <span className="mascot-fallback" style={{ display:'none' }}>✖️</span>
      </div>

      {/* O mascot */}
      <div className="mascot mascot-o" aria-hidden="true">
        <img src="/images/o-mascot.png" alt=""
          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block'; }} />
        <span className="mascot-fallback" style={{ display:'none' }}>⭕</span>
      </div>

      {/* ── Centred game shell ── */}
      <div className="content-shell">

        {/* Title */}
        <h1 className="game-title" style={{ marginBottom:4 }}>
          <span className="title-tic">TIC</span>{' '}
          <span className="title-tac">TAC</span>{' '}
          <span className="title-toe">TOE</span>
          {' '}<span className="title-crown" role="img" aria-label="crown">👑</span>
        </h1>

        {/* Info bar */}
        <div className="card game-info-bar">
          <div className="info-item">
            You are:&nbsp;
            <span className={`info-val ${mySymbol === 'X' ? 'marker-x' : 'marker-o'}`}>
              {mySymbol === 'X' ? '✖' : mySymbol === 'O' ? '●' : '…'}
            </span>
          </div>
          <div className="info-item">
            Players:&nbsp;
            <span className="info-val" style={{ color: playerCount === 2 ? '#5effa0' : '#ffe77a' }}>
              {playerCount}/2
            </span>
          </div>
        </div>

        {/* Status pill */}
        <div className={`status-pill ${statusClass}`} role="status">
          {statusText}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="status-pill" style={{ borderColor:'#ff6eb3', color:'#ff6eb3', background:'rgba(80,0,30,0.7)' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Board */}
        <div className="board-wrapper">
          <div className="board-grid" role="grid" aria-label="Tic Tac Toe Board">
            {board.map((cell, i) => {
              const isTaken   = !!cell;
              const isDisabled = gameOver || !isMyTurn || isTaken;
              return (
                <button
                  key={i}
                  className={[
                    'cell',
                    isTaken   ? 'taken'    : '',
                    isDisabled ? 'disabled' : '',
                    cell === 'X' ? 'cell-x' : '',
                    cell === 'O' ? 'cell-o' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleCellClick(i)}
                  disabled={isDisabled}
                  aria-label={cell ? `${cell} in cell ${i + 1}` : `Empty cell ${i + 1}`}
                  role="gridcell"
                >
                  {cell === 'X' ? '✖' : cell === 'O' ? '●' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="actions-row">
          {gameOver && !rematchPending && (
            <button className="btn btn-yellow btn-play-again" onClick={handlePlayAgain}>
              🔄 Play Again
            </button>
          )}
          {rematchPending && (
            <div className="status-pill" style={{ borderColor:'#ffe77a', color:'#ffe77a' }}>
              <span className="spinner" />
              Waiting for opponent to rematch…
            </div>
          )}
          <button className="btn btn-pink" onClick={handleLeave}>
            Leave Game
          </button>
        </div>

      </div>{/* /content-shell */}
    </div>
  );
}
