import { DiscordSDK } from '@discord/embedded-app-sdk'

let discordSdk = null
let user = null
let roomId = null

export async function initializeDiscordSDK() {
  discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID)
  
  try {
    await discordSdk.ready()
    
    const { code } = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: 'code',
      state: '',
      prompt: 'none',
      scope: ['identify'],
    })
    
    const response = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    
    const { access_token } = await response.json()
    const auth = await discordSdk.commands.authenticate({ access_token })
    
    if (!auth) throw new Error('Authentication failed')
    
    user = auth.user
    // Use instanceId as room ID (same Activity = same room)
    roomId = discordSdk.instanceId || `discord-${Date.now()}`
    
    console.log('Discord SDK initialized successfully')
  } catch (error) {
    console.error('Discord SDK initialization error:', error)
    throw error
  }
}

export function getDiscordUser() {
  return user
}

export function getRoomId() {
  return roomId
}

export function getDiscordSdk() {
  return discordSdk
}
