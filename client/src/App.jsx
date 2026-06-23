import { useState, useEffect } from 'react'
import { initializeDiscordSDK, getDiscordUser, getRoomId } from './utils/discordSetup'
import Home from './pages/Home'
import Game from './pages/Game'
import './index.css'

export default function App() {
  const [page, setPage] = useState('home')
  const [roomId, setRoomId] = useState(null)
  const [user, setUser] = useState(null)
  const [discordReady, setDiscordReady] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  useEffect(() => {
    const setupDiscord = async () => {
      try {
        await initializeDiscordSDK()
        const discordUser = getDiscordUser()
        const discordRoomId = getRoomId()
        
        setUser(discordUser)
        setRoomId(discordRoomId)
        setDiscordReady(true)
        setConnectionStatus('ready')
      } catch (error) {
        console.log('Discord SDK not available (expected for local testing). Using fallback.')
        // Fallback for local testing
        setUser({ id: `user_${Math.random().toString(36).substr(2, 9)}`, username: 'Local Player' })
        setRoomId('local-test-room')
        setDiscordReady(true)
        setConnectionStatus('ready')
      }
    }

    setupDiscord()
  }, [])

  const handleNavigateToGame = () => {
    if (roomId) {
      setPage('game')
    }
  }

  const handleLeaveGame = () => {
    setConnectionStatus('ready')
    setPage('home')
  }

  if (!discordReady) {
    return (
      <div className="app-container">
        <div className="loading">Loading Discord Activity...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {page === 'home' && (
        <Home 
          roomId={roomId} 
          onJoinGame={handleNavigateToGame}
          connectionStatus={connectionStatus}
        />
      )}
      {page === 'game' && (
        <Game 
          roomId={roomId} 
          user={user}
          onLeaveGame={handleLeaveGame}
          onConnectionChange={setConnectionStatus}
        />
      )}
    </div>
  )
}
