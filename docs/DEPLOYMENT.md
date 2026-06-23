# Deployment Guide

This guide walks you through deploying the Tic Tac Toe Activity to Vercel (frontend) and Render (backend).

## Prerequisites
- GitHub account (recommended, but not required)
- Vercel account (free tier available)
- Render account (free tier available)
- Discord application already created (see DISCORD_SETUP.md)

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub (Recommended)

If not already done:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/discord-tic-tac-toe.git
git push -u origin main
```

### Step 2: Create Render Account

1. Go to [Render.com](https://render.com)
2. Click **"Sign Up"**
3. Sign in with GitHub or create account
4. Click **"New Web Service"**

### Step 3: Connect Repository

1. Click **"Connect Repository"**
2. Search for your repository
3. Click **"Connect"**

### Step 4: Configure Web Service

Fill in the form:
- **Name**: `tictactoe-backend` (or your choice)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### Step 5: Set Environment Variables

Click **"Advanced"** and add:
- Key: `PORT` | Value: `3001`
- Key: `FRONTEND_URL` | Value: `https://your-vercel-domain.vercel.app`

### Step 6: Deploy

Click **"Create Web Service"**

Render will automatically deploy. When it's done, you'll see a URL like:
```
https://tictactoe-backend.onrender.com
```

Save this URL!

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Sign up (GitHub recommended)
3. Click **"Import Project"**

### Step 2: Import Repository

1. Paste your GitHub repository URL
2. Click **"Continue"**

### Step 3: Configure Project

Fill in:
- **Framework Preset**: `Vite`
- **Build Output Directory**: `dist` (should auto-select)
- **Build Command**: `npm run build` (should auto-select)
- **Install Command**: `npm install` (should auto-select)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:
- Key: `VITE_DISCORD_CLIENT_ID` | Value: `your_client_id`
- Key: `VITE_SERVER_URL` | Value: `https://tictactoe-backend.onrender.com`

### Step 5: Deploy

Click **"Deploy"**

Vercel will build and deploy. You'll get a URL like:
```
https://tictactoe-discord.vercel.app
```

## Part 3: Update Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your **Tic Tac Toe** application
3. Go to **"OAuth2" → "General"**
4. Update **Redirects** to your Vercel URL:
   ```
   https://your-vercel-domain.vercel.app
   ```
5. Go to **"Activities"** section
6. Update the **URL** to:
   ```
   https://your-vercel-domain.vercel.app
   ```

## Part 4: Verify Deployment

### Test Backend
```bash
curl https://tictactoe-backend.onrender.com/
```
Should return: `Tic Tac Toe backend running`

### Test Frontend
1. Open `https://your-vercel-domain.vercel.app`
2. See if home page loads
3. Try joining a game with two tabs (using fallback room ID)

### Test in Discord
1. In Discord, open the Activity
2. Click "Join Game"
3. Game should work!

## Troubleshooting

### "Cannot GET /" error on backend
- Make sure `npm start` runs correctly locally
- Check that `server.js` is in the root of the server folder
- Verify all dependencies are in `package.json`

### CORS errors
- Backend needs correct `FRONTEND_URL` env variable
- Frontend needs correct `VITE_SERVER_URL` env variable
- Both must be updated after deployment

### Activity not loading in Discord
- Check frontend URL is correct in Discord Developer Portal
- Verify Vercel deployment is successful
- Check browser console for errors
- Try refreshing Discord

### Socket.IO connection fails
- Backend URL must be correct in `VITE_SERVER_URL`
- Backend must be running
- Check browser console WebSocket errors

### Environment variables not working
- Redeploy after adding environment variables
- Wait a few minutes for changes to propagate
- Check that variables are spelled correctly

## Environment Variables Reference

### Frontend (.env)
```
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_SERVER_URL=https://your-render-backend.onrender.com
```

### Backend (.env)
```
PORT=3001
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

## Performance Tips

- Render free tier: Apps sleep after 15 minutes of inactivity
- To keep backend awake: use a cron job or uptime monitor
- Vercel deployments are instant and performant
- Consider upgrading to paid tiers for production

## Manual Deployment (Alternative)

If you prefer not to use GitHub:

### Deploy Backend to Render
1. ZIP your `server/` folder
2. Extract on Render directly
3. Configure as above

### Deploy Frontend to Vercel
1. ZIP your `client/` folder
2. Run `npm run build` locally
3. Upload `dist/` folder to Vercel

## Redeploy Updates

After making code changes:

### Backend (Render)
1. Push to GitHub
2. Render auto-redeploys (if connected)
3. Or manually trigger redeployment in Render dashboard

### Frontend (Vercel)
1. Push to GitHub
2. Vercel auto-redeploys
3. Or manually trigger in Vercel dashboard

## Monitoring & Logs

### Backend Logs (Render)
- Dashboard → Your Service → Logs

### Frontend Logs (Vercel)
- Dashboard → Deployments → Select deployment → Logs

## Security

- Keep client ID in GitHub (it's public)
- Never commit `.env` files
- Add `.env*` to `.gitignore`
- Client Secret should never be exposed
- For sensitive data, only store on backend

## Next Steps

- Set up monitoring/alerts
- Configure custom domain (optional)
- Set up analytics
- Invite friends to play!

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review environment variables
3. Check Render/Vercel logs
4. Verify Discord app configuration
