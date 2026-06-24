export default function Home({ roomId, onJoinGame, connectionStatus }) {
  const isReady = connectionStatus === "ready";

  return (
    <div className="home-page">
      {/* Decorative background doodles */}
      <div className="doodle doodle-xo doodle-tl">XO</div>
      <div className="doodle doodle-xo doodle-tr">OX</div>
      <div className="doodle doodle-xo doodle-bl">OX</div>
      <div className="doodle doodle-xo doodle-br">XO</div>
      <span className="sparkle sp1">✦</span>
      <span className="sparkle sp2">✦</span>
      <span className="sparkle sp3">✦</span>
      <span className="sparkle sp4">✦</span>
      <span className="sparkle sp5">★</span>
      <span className="sparkle sp6">✦</span>

      <div className="home-container">
        {/* Mascots */}
        <div className="mascot mascot-x" aria-hidden="true">✕</div>
        <div className="mascot mascot-o" aria-hidden="true">○</div>

        {/* Title */}
        <div className="title-block">
          <div className="crown" aria-hidden="true">👑</div>
          <h1 className="game-title">
            <span className="title-tic">TIC</span>{" "}
            <span className="title-tac">TAC</span>{" "}
            <span className="title-toe">TOE</span>
          </h1>
          <p className="game-subtitle">
            <span className="star-icon">★</span> 2 Player Discord Activity{" "}
            <span className="star-icon">★</span>
          </p>
        </div>

        {/* Lobby panel */}
        <div className="lobby-panel">
          <div className="lobby-row">
            <span className="lobby-icon">🎮</span>
            <span className="lobby-label">Room:</span>
            <span className="lobby-value room-id">{roomId}</span>
          </div>
          <div className="lobby-divider" />
          <div className="lobby-row">
            <span className="lobby-icon">😊</span>
            <span className="lobby-label">Status:</span>
            <span className={`status-badge ${isReady ? "status-ready" : "status-waiting"}`}>
              <span className="status-dot" />
              {connectionStatus}
            </span>
          </div>
        </div>

        {/* Join button */}
        <button
          className={`join-btn ${!isReady ? "join-btn-disabled" : ""}`}
          onClick={onJoinGame}
          disabled={!isReady}
        >
          <span className="join-btn-sparkle">✨</span>
          JOIN GAME
          <span className="join-btn-sparkle">✨</span>
        </button>

        {/* How to Play */}
        <div className="how-to-play">
          <div className="htp-header">
            <span className="htp-leaf">🌟</span>
            <span className="htp-title">HOW TO PLAY</span>
            <span className="htp-leaf">🌟</span>
          </div>
          <ul className="htp-list">
            <li>
              <span className="htp-icon">✕</span>
              First player gets X, second player gets O
            </li>
            <li>
              <span className="htp-icon htp-icon-pink">✕</span>
              X always goes first
            </li>
            <li>
              <span className="htp-icon htp-icon-pencil">✏️</span>
              Click on empty cells to make your move
            </li>
            <li>
              <span className="htp-icon htp-icon-star">⭐</span>
              First to get 3 in a row wins!
            </li>
            <li>
              <span className="htp-icon htp-icon-loop">🔄</span>
              Play again with the same opponent after each game
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
