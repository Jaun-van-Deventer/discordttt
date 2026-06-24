// src/components/Home.jsx
// Tic Tac Toe — Discord Activity | Home Page
// ─────────────────────────────────────────────

import React from 'react';

/**
 * Props (unchanged from original):
 *  roomId           {string}
 *  connectionStatus {string}  'connecting' | 'ready' | 'error' | ...
 *  onJoinGame       {function}
 */
export default function Home({ roomId, connectionStatus, onJoinGame }) {
  const isReady = connectionStatus === 'ready';

  // Status badge helper
  const statusClass =
    connectionStatus === 'ready'      ? 'ready' :
    connectionStatus === 'connecting' ? 'connecting' : 'error';

  const statusLabel =
    connectionStatus === 'ready'      ? 'Ready' :
    connectionStatus === 'connecting' ? 'Connecting…' :
    connectionStatus === 'error'      ? 'Error' :
    connectionStatus || 'Unknown';

  return (
    <div className="themed-page home-page">
      {/* ── Background deco layer ── */}
      <div className="bg-deco" aria-hidden="true" />

      {/* Scattered stars */}
      <span className="star-scatter" style={{ top:'8%',  left:'22%', animationDelay:'0s'   }}>✦</span>
      <span className="star-scatter" style={{ top:'15%', left:'70%', animationDelay:'0.6s' }}>✧</span>
      <span className="star-scatter" style={{ top:'38%', left:'14%', animationDelay:'1.1s' }}>✦</span>
      <span className="star-scatter" style={{ top:'55%', left:'80%', animationDelay:'0.3s' }}>✦</span>
      <span className="star-scatter" style={{ top:'72%', left:'55%', animationDelay:'1.8s' }}>✧</span>
      <span className="star-scatter" style={{ top:'20%', right:'20%', animationDelay:'0.9s' }}>✦</span>

      {/* Deco items — arrows, XO doodles, pencils */}
      <span className="deco-item" style={{ top:'5%',  left:'8%',  fontSize:'1rem', color:'rgba(255,255,255,0.4)', transform:'rotate(-20deg)' }}>→</span>
      <span className="deco-item" style={{ top:'28%', left:'6%',  fontSize:'0.85rem', color:'rgba(255,220,255,0.4)' }}>XO</span>
      <span className="deco-item" style={{ top:'65%', right:'7%', fontSize:'1.2rem', color:'rgba(255,255,255,0.35)', transform:'rotate(15deg)' }}>✏️</span>
      <span className="deco-item" style={{ top:'8%',  right:'8%', fontSize:'0.9rem', color:'rgba(200,180,255,0.5)' }}>XO</span>
      <span className="deco-item" style={{ top:'42%', right:'5%', fontSize:'1.5rem', color:'rgba(255,255,255,0.25)', transform:'rotate(-8deg)' }}>⚡</span>
      <span className="deco-item" style={{ bottom:'14%', left:'9%', fontSize:'1.2rem', color:'rgba(255,230,100,0.55)' }}>⭐</span>
      <span className="deco-item" style={{ bottom:'18%', right:'9%', fontSize:'1rem', color:'rgba(100,220,255,0.6)' }}>⭐</span>

      {/* "Let's Play!" speech bubble */}
      <div className="lets-play-bubble" aria-hidden="true">LET'S<br/>PLAY!</div>

      {/* X mascot — left */}
      <div className="mascot mascot-x" aria-hidden="true">
        <img
          src="/images/x-mascot.png"
          alt=""
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block'; }}
        />
        <span className="mascot-fallback" style={{ display:'none' }}>✖️</span>
      </div>

      {/* O mascot — right */}
      <div className="mascot mascot-o" aria-hidden="true">
        <img
          src="/images/o-mascot.png"
          alt=""
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block'; }}
        />
        <span className="mascot-fallback" style={{ display:'none' }}>⭕</span>
      </div>

      {/* ── Centred content ── */}
      <div className="content-shell">

        {/* Title */}
        <div style={{ textAlign:'center' }}>
          <h1 className="game-title">
            <span className="title-tic">TIC</span>{' '}
            <span className="title-tac">TAC</span>{' '}
            <span className="title-toe">TOE</span>
            {' '}<span className="title-crown" role="img" aria-label="crown">👑</span>
          </h1>
          <p className="game-subtitle">⭐ 2 Player Discord Activity ⭐</p>
        </div>

        {/* Room & Status card */}
        <div className="card room-card">
          <div className="room-row">
            <span className="row-icon">🔴</span>
            <span className="row-label">Room:</span>
            <span className="row-value" title={roomId}>{roomId || 'Loading…'}</span>
          </div>
          <div className="room-row">
            <span className="row-icon">😊</span>
            <span className="row-label">Status:</span>
            <span className={`status-badge ${statusClass}`}>
              <span className={`status-dot ${statusClass}`} />
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Join button */}
        <button
          className="btn btn-yellow"
          onClick={onJoinGame}
          disabled={!isReady}
          aria-label="Join Game"
        >
          🎮 JOIN GAME 🎮
        </button>

        {/* How-to-play card */}
        <div className="card how-to-card">
          <div className="how-to-header">🎯 HOW TO PLAY 🎯</div>
          <ul className="how-to-list">
            <li>
              <span className="htp-icon" style={{ color:'#5de6ff' }}>✖</span>
              First player gets X, second player gets O
            </li>
            <li>
              <span className="htp-icon" style={{ color:'#ff6eb3' }}>✖</span>
              X always goes first
            </li>
            <li>
              <span className="htp-icon">✏️</span>
              Click on empty cells to make your move
            </li>
            <li>
              <span className="htp-icon">⭐</span>
              First to get 3 in a row wins!
            </li>
            <li>
              <span className="htp-icon">🔄</span>
              Play again with the same opponent after each game
            </li>
          </ul>
        </div>

      </div>{/* /content-shell */}
    </div>
  );
}
