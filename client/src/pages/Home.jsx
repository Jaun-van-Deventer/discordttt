export default function Home({ roomId, onJoinGame, connectionStatus }) {
  return (
    <div className="page home-page">
      <div className="container">
        <h1 className="title">Tic Tac Toe</h1>
        <p className="subtitle">2 Player Discord Activity</p>
        
        <div className="info-box">
          <p className="room-id">Room: <code>{roomId}</code></p>
          <p className="status">
            Status: <span className={`status-indicator ${connectionStatus}`}>{connectionStatus}</span>
          </p>
        </div>

        <button 
          className="btn btn-primary btn-large"
          onClick={onJoinGame}
          disabled={connectionStatus !== 'ready'}
        >
          Join Game
        </button>

        <div className="instructions">
          <h3>How to Play</h3>
          <ul>
            <li>First player gets X, second player gets O</li>
            <li>X always goes first</li>
            <li>Click on empty cells to make your move</li>
            <li>First to get 3 in a row wins!</li>
            <li>Play again with the same opponent after each game</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
