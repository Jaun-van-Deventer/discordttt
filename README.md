# Tic Tac Toe - Discord Activity

A simple, clean 2-player Tic-Tac-Toe game built as a Discord Activity. Perfect as a learning project or to play with friends in Discord.

## Features

✨ **Live Multiplayer**: Real-time game sync using Socket.IO
🎮 **Discord Integration**: Uses Discord Embedded App SDK and instanceId for room identification
🔄 **Rematch System**: Play multiple rounds without refreshing
💻 **Local Testing**: Works with two browser tabs using a fallback room ID
📱 **Responsive Design**: Discord-like dark theme UI, mobile-friendly
⚡ **Simple & Clean**: Beginner-friendly codebase with clear separation of concerns

## Tech Stack

### Frontend
- **Vite** - Build tool
- **React** - UI framework
- **Socket.IO Client** - Real-time communication
- **Discord Embedded App SDK** - Discord integration

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - Real-time server
- **CORS** - Cross-origin requests

## Project Structure

```
discord-activity-youtube-tutorial-main/
├── client/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main app component
│   │   ├── index.css             # Global styles
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Home page
│   │   │   └── Game.jsx          # Game page
│   │   └── utils/
│   │       ├── discordSetup.js   # Discord SDK init
│   │       └── socket.js         # Socket.IO client
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── server/
│   ├── server.js                 # Express + Socket.IO server
│   ├── package.json
│   └── .env.example
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- A Discord application (see Discord Setup section)

### Local Development

1. **Install dependencies**
   ```bash
   # Frontend
   cd client
   npm install
   
   # Backend (in another terminal)
   cd server
   npm install
   ```

2. **Setup environment variables**
   ```bash
   # client/.env
   VITE_DISCORD_CLIENT_ID=your_client_id
   VITE_SERVER_URL=http://localhost:3001
   
   # server/.env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start the backend**
   ```bash
   cd server
   npm start
   ```
   Backend runs on `http://localhost:3001`

4. **Start the frontend (new terminal)**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

5. **Test locally**
   - Open `http://localhost:5173` in two browser tabs
   - Click "Join Game" in both tabs
   - First tab becomes X, second tab becomes O
   - Play the game!

## How to Play

1. **Join**: Two players click "Join Game"
2. **Play**: X goes first, take turns clicking cells
3. **Win**: Get 3 in a row (horizontal, vertical, or diagonal)
4. **Draw**: All cells filled with no winner
5. **Rematch**: Both players click "Play Again" to play again

## Discord Activity Setup

See [DISCORD_SETUP.md](./docs/DISCORD_SETUP.md) for detailed Discord Developer Portal instructions.

## Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed Vercel and Render deployment instructions.

## Game Rules

- **X always starts first**
- Click empty cells to make your move
- Only playable during your turn
- First to 3 in a row wins
- If board is full with no winner, it's a draw
- Rematch resets board (alternates starting player each game)

## How It Works

### Discord Integration
- Uses Discord Embedded App SDK to get `instanceId`
- `instanceId` serves as the room ID - same Discord Activity = same game room
- Fallback room ID for local testing: `local-test-room`

### Socket.IO Communication
**Frontend → Backend**
- `joinRoom`: Player joins a game room
- `makeMove`: Player makes a move
- `requestRematch`: Player votes for rematch
- `leaveRoom`: Player leaves the game

**Backend → Frontend**
- `roomUpdate`: Full room state broadcast
- `roomFull`: Room already has 2 players
- `invalidMove`: Move validation failed
- `opponentLeft`: Opponent disconnected

### Game Logic
- Backend is the source of truth
- All moves validated on server
- Win detection: 8 winning combinations checked
- Draw detection: board full with no winner
- Rematch: requires both players to vote

## File Descriptions

### Frontend
- **main.jsx**: React entry point, renders App
- **App.jsx**: Main component, manages Discord init and page routing
- **Home.jsx**: Home page with join button
- **Game.jsx**: Game board, player info, status messages
- **discordSetup.js**: Discord SDK initialization and user data
- **socket.js**: Socket.IO client with event handlers
- **index.css**: All styling (Discord dark theme)

### Backend
- **server.js**: Express server + Socket.IO implementation
  - Game room management
  - Win/draw detection
  - Turn validation
  - Rematch voting

## Testing Checklist

- ✅ Backend runs on port 3001
- ✅ Frontend runs on port 5173
- ✅ Two tabs can join the same room
- ✅ First player is X, second is O
- ✅ Third tab gets "Room is full"
- ✅ Players can take turns
- ✅ Wins detected correctly
- ✅ Draws detected correctly
- ✅ Rematch works (both must click)
- ✅ Either player can leave
- ✅ Opponent sees "left" message
- ✅ Same system works in Discord

## Troubleshooting

### "Room is full" error
- The room already has 2 players
- Try the game with a new room ID or wait for a player to leave

### Moves not working
- Check that it's your turn
- Make sure cell is empty
- Verify Socket.IO connection in browser console

### Discord SDK errors
- Check `VITE_DISCORD_CLIENT_ID` is correct
- Verify the app is registered in Discord Developer Portal
- When not in Discord, the app falls back to local testing

### Socket.IO connection issues
- Backend must be running on port 3001
- Check CORS is configured correctly in backend
- Frontend `VITE_SERVER_URL` must match backend URL

## Contributing

This is a learning project. Feel free to fork and modify!

## License

MIT

## Need Help?

Check the setup guides for more information.

