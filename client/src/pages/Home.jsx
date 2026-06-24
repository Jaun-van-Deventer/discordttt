export default function Home({ roomId, onJoinGame, connectionStatus }) {
  const isReady = connectionStatus === "ready"

  return (
    <div className="page home-page">
      <div className="bg-doodles">
        <span className="doodle doodle-1">✦</span>
        <span className="doodle doodle-2">XO</span>
        <span className="doodle doodle-3">✎</span>
        <span className="doodle doodle-4">★</span>
        <span className="doodle doodle-5">↝</span>
        <span className="doodle doodle-6">#</span>
        <span className="doodle doodle-7">♡</span>
        <span className="doodle doodle-8">⚡</span>
      </div>

      <div className="cartoon-character character-x">X</div>
      <div className="cartoon-character character-o">O</div>

      <div className="home-container">
        <div className="title-wrap">
          <div className="mini-crown">♛</div>

          <h1 className="cartoon-title">
            <span>Tic</span>
            <span>Tac</span>
            <span>Toe</span>
          </h1>

          <p className="subtitle">
            <span>★</span>
            2 Player Discord Activity
            <span>★</span>
          </p>
        </div>

        <div className="info-box">
          <div className="info-row">
            <div className="info-icon">#</div>

            <p className="room-id">
              <strong>Room:</strong>
              <code>{roomId}</code>
            </p>
          </div>

          <div className="info-row">
            <div className="info-icon">☻</div>

            <p className="status">
              <strong>Status:</strong>

              <span className={`status-indicator ${connectionStatus}`}>
                <span className="status-dot" />
                {connectionStatus}
              </span>
            </p>
          </div>
        </div>

        <button
          className="join-button"
          onClick={onJoinGame}
          disabled={!isReady}
        >
          Join Game
        </button>

        <div className="instructions">
          <div className="instructions-label">How to Play</div>

          <ul>
            <li>
              <span className="rule-icon blue">X</span>
              First player gets X, second player gets O
            </li>

            <li>
              <span className="rule-icon pink">X</span>
              X always goes first
            </li>

            <li>
              <span className="rule-icon yellow">✎</span>
              Click on empty cells to make your move
            </li>

            <li>
              <span className="rule-icon blue">★</span>
              First to get 3 in a row wins!
            </li>

            <li>
              <span className="rule-icon purple">↻</span>
              Play again with the same opponent after each game
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
