# Local Setup Guide

This guide walks you through setting up and running the Tic Tac Toe Activity locally for development and testing.

## Prerequisites

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm 7+** - Comes with Node.js
- **Git** (optional) - For version control
- **Two browser tabs or windows** - For testing

## Step 1: Verify Node.js Installation

```bash
node --version
npm --version
```

Should show versions like:
```
v18.0.0
9.0.0
```

## Step 2: Install Dependencies

### Install Backend Dependencies

```bash
cd server
npm install
```

This installs:
- express
- socket.io
- cors
- dotenv

### Install Frontend Dependencies

```bash
cd ../client
npm install
```

This installs:
- react
- react-dom
- socket.io-client
- @discord/embedded-app-sdk
- vite
- @vitejs/plugin-react

## Step 3: Configure Environment Variables

### Backend Setup

Create `server/.env`:
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend Setup

Create `client/.env`:
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```
VITE_DISCORD_CLIENT_ID=test_client_id_local_testing
VITE_SERVER_URL=http://localhost:3001
```

**Note**: For local testing without Discord, the client ID can be anything. The app will fall back to local testing mode.

## Step 4: Start the Backend

Open a terminal and run:

```bash
cd server
npm start
```

You should see:
```
Tic Tac Toe server listening on port 3001
```

The backend is now running and listening for Socket.IO connections.

### Backend Health Check

In another terminal, verify the backend is running:
```bash
curl http://localhost:3001/
```

Should return:
```
Tic Tac Toe backend running
```

## Step 5: Start the Frontend

Open a new terminal and run:

```bash
cd client
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

## Step 6: Test Locally

### Single Tab Test

1. Open `http://localhost:5173` in your browser
2. You should see the Tic Tac Toe home page
3. The status should show "Connected"
4. Click "Join Game"
5. You should see the game board

### Two Tab Test (Full Game)

1. Open `http://localhost:5173` in **Tab 1**
2. Open `http://localhost:5173` in **Tab 2** (same URL)
3. In **Tab 1**, click "Join Game"
4. In **Tab 2**, click "Join Game"
5. **Tab 1** should show "You are: X"
6. **Tab 2** should show "You are: O"
7. **Tab 1** should show "Your turn"
8. Play the game:
   - Tab 1 (X) clicks a cell
   - Tab 2 should instantly see the X
   - Tab 2 (O) clicks a cell
   - Continue playing!

### Three Tab Test (Room Full)

1. Follow the two tab test above
2. Open `http://localhost:5173` in **Tab 3**
3. Click "Join Game" in Tab 3
4. **Tab 3** should show "Room is full"

### Rematch Test

1. Play a game until someone wins
2. Click "Play Again" button
3. Both players must click "Play Again"
4. Game resets and starts again

### Leave Game Test

1. During a game, click "Leave Game"
2. You should return to home page
3. Other player should see "Opponent left"
4. Other player can click "Leave Game" to exit

## Step 7: Browser DevTools

### Check Socket.IO Connection

Open browser DevTools (F12) and go to **Console**:

Look for messages like:
```
Connected to server
Socket.IO connection established
```

### Monitor Network Traffic

Go to **Network** tab:
- WebSocket connections should show as `ws://` requests
- Look for messages being sent/received in real-time

## Testing Checklist

Run through these tests to verify everything works:

- [ ] Backend starts on port 3001
- [ ] Frontend starts on port 5173
- [ ] Can access home page
- [ ] Connection status shows "Connected"
- [ ] Two tabs can join same room
- [ ] First tab becomes X, second becomes O
- [ ] Third tab blocked with "Room is full"
- [ ] Can click cells and make moves
- [ ] Moves instantly appear on other tab
- [ ] Players can take turns correctly
- [ ] Winning combinations are detected
- [ ] Draw (full board) is detected
- [ ] Can click "Play Again"
- [ ] Both players must click Play Again
- [ ] Game resets after rematch
- [ ] Can leave game
- [ ] Opponent sees "left" message
- [ ] Can start new game after leaving

## Troubleshooting

### Backend won't start

**Error**: `EADDRINUSE: address already in use :::3001`
- Another process is using port 3001
- Solution: Kill the process or use a different port
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

### Frontend won't load

**Error**: `VITE: Internal server error`
- Check Node.js version (need 16+)
- Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Socket.IO connection fails

**Error**: `GET http://localhost:3001/socket.io/?...`
- Backend not running (start it with `npm start`)
- Check `VITE_SERVER_URL` is correct in `.env`
- Port 3001 not accessible

### No moves appearing

**Issue**: Click cell but nothing happens

**Debug steps**:
1. Check browser console for errors
2. Verify it's your turn (status says "Your turn")
3. Check the cell is empty (not already filled)
4. Check backend logs for move events
5. Check Socket.IO connection is active

### Game state out of sync

**Issue**: Tab 1 and Tab 2 show different boards

**Debug steps**:
1. Refresh both tabs
2. Check backend logs
3. Verify Socket.IO is connected on both tabs
4. Try leaving and rejoining

## Development Tips

### Hot Module Replacement (HMR)

When you edit React files, Vite automatically reloads:
- Changes appear instantly in browser
- Game state persists (usually)

### Debugging Game Logic

Add console logs in `server/server.js`:
```javascript
socket.on('makeMove', (data) => {
  console.log('Move received:', data)
  // ... rest of code
})
```

Check server logs in terminal:
```bash
cd server
npm start
# Watch for console.log output
```

### Debugging Frontend

Add console logs in `client/src/pages/Game.jsx`:
```javascript
useEffect(() => {
  onRoomUpdateListener((data) => {
    console.log('Room state:', data)
    // ... rest of code
  })
}, [])
```

Check browser console (F12 → Console tab)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3001 in use | Kill process or change PORT in .env |
| Port 5173 in use | Change port in vite.config.js |
| CORS errors | Check FRONTEND_URL on backend |
| Socket connection failed | Check VITE_SERVER_URL on frontend |
| Discord SDK errors | Normal when not in Discord, uses fallback |
| Moves not syncing | Check Socket.IO WebSocket in DevTools |
| Room stuck "waiting" | One player crashed, refresh to fix |

## Next Steps

- Make code changes and see them live
- Try modifying game rules in `server/server.js`
- Try styling changes in `client/src/index.css`
- When ready, deploy to Vercel + Render (see DEPLOYMENT.md)

## Terminal Commands Reference

```bash
# Backend
cd server
npm install              # Install dependencies
npm start               # Start server (port 3001)

# Frontend
cd ../client
npm install             # Install dependencies
npm run dev             # Start dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
```

## Useful Files to Modify

For learning/experimentation:

- **Game logic**: `server/server.js` (validation, win detection)
- **Styling**: `client/src/index.css` (colors, layout)
- **UI components**: `client/src/pages/Game.jsx` (board display)
- **Backend validation**: `server/server.js` (server-side rules)

Good luck developing! 🎮
