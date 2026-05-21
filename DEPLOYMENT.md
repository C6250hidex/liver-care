# LiverCare AI - Deployment Guide

## Overview

This application is deployed across multiple platforms:

- **Frontend**: Render.com (https://liver-care-client.onrender.com)
- **Backend**: Render.com (https://liver-care-api.onrender.com)
- **Database**: Aiven MySQL

## Prerequisites

- Git
- GitHub account with repo push access
- Render.com account (free tier available)
- Aiven MySQL database (or any MySQL compatible DB)
- Brevo (Sendinblue) account for email service

## Step 1: Database Setup (Aiven MySQL)

1. Go to [Aiven.io](https://aiven.io)
2. Create a MySQL service
3. Note these credentials:
   - **Host**: Your Aiven MySQL host
   - **Port**: Typically 21814 (HTTPS) or 3306 (plain)
   - **User**: Usually `avnadmin`
   - **Password**: Your Aiven password
   - **Database**: Create a database named `liver_care_db`

4. Run the database schema from `LIVER-_CARE.session.sql`:
   ```bash
   mysql -h your-aiven-host -u avnadmin -p liver_care_db < LIVER-_CARE.session.sql
   ```

## Step 2: Backend Deployment (Render.com)

### Prepare Environment

1. Copy `.env.example` to `.env` and fill in:

   ```bash
   cp server/.env.example server/.env
   ```

2. Update these variables:
   ```
   DB_HOST=your-aiven-host
   DB_USER=avnadmin
   DB_PASSWORD=your-password
   DB_PORT=21814
   JWT_SECRET=your-secret-key-min-32-chars
   BREVO_API_KEY=your-brevo-key
   SENDER_EMAIL=your-email@example.com
   CLIENT_URL=https://liver-care-client.onrender.com
   ```

### Deploy to Render

1. Go to [Render.com](https://render.com)
2. Click "New+" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: `liver-care-api`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free tier (or paid)

5. Add Environment Variables (from your `.env` file):
   - All `DB_*` variables
   - `JWT_SECRET`
   - `BREVO_API_KEY`
   - `SENDER_EMAIL`
   - `CLIENT_URL`
   - `PORT=5000`
   - `NODE_ENV=production`

6. Deploy

### Verify Backend

```bash
curl https://liver-care-api.onrender.com/api/health
# Should respond with: {"status":"ok","timestamp":"...","uptime":...}
```

## Step 3: Frontend Deployment (Render.com)

### Prepare Environment

1. Copy `.env.example`:

   ```bash
   cp client/.env.example client/.env
   ```

2. Update:
   ```
   VITE_API_BASE_URL=https://liver-care-api.onrender.com/api
   ```

### Deploy to Render

1. Go to [Render.com](https://render.com)
2. Click "New+" → "Static Site"
3. Connect your GitHub repo
4. Configure:
   - **Name**: `liver-care-client`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

5. Add Environment Variables:
   - `VITE_API_BASE_URL=https://liver-care-api.onrender.com/api`

6. Deploy

### Verify Frontend

Visit: https://liver-care-client.onrender.com

## Step 4: Post-Deployment Checks

### 1. Test Database Connection

```bash
curl https://liver-care-api.onrender.com/api/test-db
# Should respond: {"message":"Database Connected!","result":[...]}
```

### 2. Test Health Endpoint

```bash
curl https://liver-care-api.onrender.com/api/health
```

### 3. Test User Registration

- Visit the frontend
- Try registering a new user
- Check email verification (if Brevo is configured)

### 4. Check Render Logs

- Go to Render dashboard
- Open your service logs
- Look for any errors

## Troubleshooting

### Backend won't start

- Check `NODE_ENV=production`
- Verify all `DB_*` variables are set
- Check `JWT_SECRET` is set (min 32 chars)
- Review Render logs for specific errors

### Database connection fails

- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- For Aiven, ensure you're using correct port (usually 21814)
- Check if SSL is required (most cloud DBs require it)

### Frontend can't reach API

- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is running and accessible
- Verify backend CORS includes your frontend URL

### Email not sending

- Verify `BREVO_API_KEY` is set
- Check `SENDER_EMAIL` is verified in Brevo
- Review Render logs for email errors

## Environment Variables Summary

### Server (.env)

```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
PORT, NODE_ENV
CLIENT_URL
JWT_SECRET
BREVO_API_KEY, SENDER_EMAIL, SENDER_NAME, REPLY_TO_EMAIL
```

### Client (.env)

```
VITE_API_BASE_URL
```

## Updates & Redeployment

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
   ```bash
   git add -A
   git commit -m "Your message"
   git push origin master
   ```
4. Render automatically redeploys on push

## Security Notes

1. Never commit `.env` files to Git
2. Use strong JWT_SECRET (minimum 32 characters)
3. Keep database credentials safe
4. Enable Aiven firewall rules to restrict access
5. Use HTTPS for all communications

## Support

For issues, check:

1. Render logs
2. Aiven MySQL dashboard
3. Browser console errors
4. Backend error logs
