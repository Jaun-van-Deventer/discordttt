# Discord Developer Setup

This guide walks you through setting up your Discord application to use this Tic Tac Toe Activity.

## Prerequisites
- A Discord account
- Access to Discord Developer Portal

## Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it `Tic Tac Toe` (or your preferred name)
4. Accept the terms and click **"Create"**

## Step 2: Get Your Client ID

1. In the left sidebar, click **"General Information"**
2. Copy your **Client ID** - you'll need this
3. Save it somewhere safe

## Step 3: Create an OAuth2 Application

1. Click **"OAuth2"** in the left sidebar
2. Click **"General"**
3. Under "Redirects", add your frontend URL:
   - **Local**: `http://localhost:5173`
   - **Production**: `https://your-vercel-domain.vercel.app`
4. Click **"Save Changes"**

## Step 4: Get Your Client Secret

1. In **"OAuth2" → "General"**
2. Find **"Client Secret"** section
3. Click **"Reset Secret"** and copy the new secret
4. Save it securely (you'll need it for backend)

## Step 5: Configure OAuth2 Scopes

1. Go to **"OAuth2" → "URL Generator"**
2. Under **Scopes**, select:
   - `identify`
   - `guilds`
3. Copy the generated URL (for testing if needed)

## Step 6: Register Your Activity

1. Go to the **"Activities"** section in Developer Portal
2. Click **"Create Activity"** or **"New Activity"**
3. Fill in the details:
   - **Name**: Tic Tac Toe
   - **Long Description**: A simple 2-player Tic-Tac-Toe game
   - **URL**: Your frontend URL
     - Local: `http://localhost:5173`
     - Production: `https://your-vercel-domain.vercel.app`
4. Save your Activity
5. Copy your **Activity ID** (you may need this)

## Step 7: Set Environment Variables

### Local Development (.env files)

**`client/.env`**
```
VITE_DISCORD_CLIENT_ID=your_client_id_here
VITE_SERVER_URL=http://localhost:3001
```

**`server/.env`**
```
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Production (Vercel/Render)

**Vercel Environment Variables**
```
VITE_DISCORD_CLIENT_ID=your_client_id
VITE_SERVER_URL=https://your-render-backend.onrender.com
```

**Render Environment Variables**
```
PORT=3001
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

## Step 8: Test Locally

1. Start backend: `cd server && npm install && npm start`
2. Start frontend: `cd client && npm install && npm run dev`
3. Open `http://localhost:5173` in your browser
4. Test with two tabs using the fallback room ID

## Step 9: Open Activity in Discord

1. In Discord, go to a server or DM
2. Click the **"Create Activity"** button (plus icon at bottom left)
3. Find and select your **Tic Tac Toe** activity
4. The activity should open in Discord!

## Troubleshooting

### Discord SDK not initializing
- Check `VITE_DISCORD_CLIENT_ID` is correct
- Verify the app is registered in Activities section
- Check OAuth2 redirect URLs match your domain

### CORS errors
- Backend CORS must allow your frontend URL
- Check `FRONTEND_URL` environment variable on backend
- In development: `http://localhost:5173`
- In production: your Vercel URL

### "Activity not found" in Discord
- Refresh Discord
- Make sure Activity is registered in Developer Portal
- Verify the URL matches your frontend

### OAuth2 errors
- Verify Client ID is correct
- Check redirect URLs in OAuth2 settings
- Make sure scopes include `identify`

## Security Checklist

- ✅ Client ID is public (safe to commit)
- ✅ Client Secret is private (never commit!)
- ✅ OAuth2 redirect URLs are whitelisted
- ✅ Verify users in backend if needed
- ✅ Use HTTPS in production

## Next Steps

- Deploy frontend to Vercel (see DEPLOYMENT.md)
- Deploy backend to Render (see DEPLOYMENT.md)
- Update environment variables on both platforms
- Update Discord Application URL to production URLs

## Useful Links

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Embedded App SDK Docs](https://discord.com/developers/docs/activities/overview)
- [OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)
