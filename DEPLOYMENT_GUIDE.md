# OmniDrive Production Deployment Guide

## Overview

This guide walks through deploying OmniDrive to production. The system consists of:

- **Backend**: Node.js/Express API (MPesa payments, database, admin)
- **Frontend**: Static HTML/CSS/JS website (PWA)
- **Mobile**: React Native/Expo app

---

## Prerequisites

- Node.js 18+ installed
- Railway CLI: `npm install -g @railway/cli`
- Vercel CLI: `npm install -g vercel`
- Expo CLI (for mobile): `npm install -g eas-cli`
- A Railway account (free tier OK)
- A Vercel account (free tier OK)
- Safaricom Daraja production credentials

---

## 1. Deploy Backend to Railway

### 1.1 Login to Railway

```bash
railway login
```

### 1.2 Navigate to backend directory

```bash
cd OmniDrive-backend
```

### 1.3 Initialize Railway project

```bash
railway init
```

Select "Empty Project" and name it `omnidrive-backend`.

### 1.4 Set environment variables

In Railway dashboard, go to your project → Variables and set:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MPESA_CONSUMER_KEY` | from Safaricom (sandbox or prod) |
| `MPESA_CONSUMER_SECRET` | from Safaricom |
| `MPESA_SHORTCODE` | your shortcode (174379 for sandbox) |
| `MPESA_PASSKEY` | your passkey |
| `MPESA_CALLBACK_URL` | `https://api.omnidrive.co.ke/api/mpesa/callback` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | your Gmail App Password |
| `ADMIN_KEY` | strong random key (32+ chars) |
| `PORT` | `3000` |

**Important**: Update `MPESA_CALLBACK_URL` to your actual Railway domain (get this after first deploy).

### 1.5 Deploy

```bash
railway up
```

This builds and deploys your backend. Wait for completion.

### 1.6 Get your backend URL

```bash
railway status
```

Note the "Public URL" - this is your backend API URL (e.g., `https://omnidrive-backend-production.up.railway.app`).

---

## 2. Deploy Frontend to Vercel

### 2.1 Login to Vercel

```bash
vercel login
```

### 2.2 Navigate to frontend directory

```bash
cd ../OmniDrive-dealership
```

### 2.3 Deploy

```bash
vercel --build-env BACKEND_URL=https://your-backend-url.up.railway.app --yes
```

Replace `https://your-backend-url.up.railway.app` with your actual Railway backend URL.

Vercel will:
- Detect your static site
- Ask to configure project (say Yes to all defaults)
- Deploy and give you a URL (e.g., `https://omnidrive-dealership.vercel.app`)

### 2.4 (Optional) Custom Domain

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add `omnidrive.co.ke` and `www.omnidrive.co.ke`
3. Vercel provides DNS records to add at your domain registrar
4. Add those records, wait for propagation

---

## 3. Configure Backend CORS

After you have both URLs:

1. Edit `OmniDrive-backend/server.js`
2. Find the `cors()` configuration
3. Add your production frontend URL to the allowed origins:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'https://kinzu-17.github.io',
        'https://omnidrive.co.ke',
        'https://www.omnidrive.co.ke',
        'https://your-vercel-app.vercel.app'  // Add this
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
```

4. Commit and push changes to trigger redeploy on Railway:

```bash
cd OmniDrive-backend
git add server.js
git commit -m "Add production frontend URL to CORS"
git push origin main
```

---

## 4. Configure Safaricom MPesa

### 4.1 Go Live (Production)

1. Log into [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Navigate to **My Apps** → select your OmniDrive app
3. Click **Go Live**
4. Fill in business details:
   - Business Name: OmniDrive
   - Business Type: E-commerce
   - Callback URL: `https://api.omnidrive.co.ke/api/mpesa/callback`
5. Submit (approval takes 1-3 business days)

### 4.2 Update Production Credentials

Once approved, update Railway env vars with **production** keys:

| Variable | Production Value |
|----------|-----------------|
| `MPESA_CONSUMER_KEY` | new production key |
| `MPESA_CONSUMER_SECRET` | new production secret |
| `MPESA_SHORTCODE` | your production shortcode (different from sandbox) |
| `MPESA_PASSKEY` | your production passkey |
| `MPESA_CALLBACK_URL` | `https://api.omnidrive.co.ke/api/mpesa/callback` |
| `NODE_ENV` | `production` |

**Important**: In production, `stkAmount` is the real amount. In sandbox it's locked to 1 KES.

---

## 5. Mobile App (Expo/React Native)

### 5.1 Update API Endpoint

Edit `OmniDrive/OmniDrive-mobile/src/services/api.js`:

```javascript
const API_BASE = __DEV__
    ? 'http://localhost:3000/api'
    : 'https://api.omnidrive.co.ke/api';
```

### 5.2 Build for Production

```bash
cd OmniDrive/OmniDrive-mobile

# Install EAS CLI
npm install -g eas-cli
eas login

# Build Android
eas build --platform android --profile production

# Build iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

### 5.3 Submit to Stores

**Google Play Store**:
1. Download `.aab` from EAS dashboard
2. Go to [Play Console](https://play.google.com/console) → Create App
3. Upload AAB, add screenshots, descriptions
4. Submit for review (1-3 days)

**Apple App Store**:
```bash
eas submit --platform ios --profile production
```

---

## 6. Domain Configuration (Optional but Recommended)

### 6.1 DNS Records

At your domain registrar (where you bought `omnidrive.co.ke`):

| Type | Name | Value |
|------|------|-------|
| A | @ | Vercel IP (from Vercel dashboard) |
| A | www | Vercel IP |
| CNAME | api | `your-backend.up.railway.app` |
| MX | @ | (your email provider) |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` (if using Gmail) |

### 6.2 SSL Certificates

- Vercel: Automatic via Let's Encrypt
- Railway: Automatic
- Custom domain at registrar: Ensure nameservers point to Vercel/Railway

### 6.3 Update URLs

After domains are live, update these in Railway env:

```
MPESA_CALLBACK_URL=https://api.omnidrive.co.ke/api/mpesa/callback
```

And in Vercel project settings → Environment Variables:

```
BACKEND_URL=https://api.omnidrive.co.ke
```

---

## 7. Post-Deployment Checklist

- [ ] Backend accessible at `https://api.omnidrive.co.ke/` → shows health JSON
- [ ] Frontend accessible at `https://omnidrive.co.ke/`
- [ ] MPesa test payment works (use sandbox first)
- [ ] Callback URL correctly configured in Safaricom dashboard
- [ ] Email notifications working (test order → receive email)
- [ ] Admin dashboard accessible at `/admin.html` (use admin key)
- [ ] Dealer registration form submits successfully
- [ ] Chat system works (messaging.html)
- [ ] Mobile app connects to production API
- [ ] SSL certificates valid (no browser warnings)
- [ ] Service worker registration works (PWA install prompt)

---

## 8. Monitoring & Maintenance

### 8.1 Railway Dashboard

- View logs: `railway logs`
- View metrics: Railway project → Metrics
- Set up alerts for downtime

### 8.2 Vercel Dashboard

- Analytics: Vercel project → Analytics
- Functions monitoring (serverless logs)
- Bandwidth/usage limits

### 8.3 Database

The backend uses SQLite (`omnidrive.db`). On Railway:
- Database persists across deploys (stored in filesystem)
- Backup regularly: `railway download omnidrive.db` or add S3 backup script
- For scale, consider migrating to PostgreSQL (Railway offers managed DB)

### 8.4 Logs

Check backend logs:
```bash
railway logs --tail
```

Check frontend errors: Vercel → project → Functions → Logs

---

## 9. Troubleshooting

### Backend not starting
- Check Port: `PORT` env var must be set (Railway sets this automatically)
- Check database file permissions
- Ensure all dependencies installed (`npm install`)

### MPesa callback failing
- Verify `MPESA_CALLBACK_URL` matches exactly in Safaricom dashboard
- Ensure CORS includes your frontend domain
- Check Railway logs for 404s on `/api/mpesa/callback`

### Frontend can't connect to backend
- Check CORS `origin` list includes your frontend URL
- Verify `BACKEND_URL` in frontend is correct
- Test API directly: `curl https://api.omnidrive.co.ke/`

### Database errors
- Railway filesystem is ephemeral across region changes; avoid deleting project
- Backup DB before destructive operations
- SQLite works for low-medium traffic; for high scale, migrate to PostgreSQL

---

## 10. Scaling Considerations

| Current Stack | Scale To |
|---|---|
| SQLite on Railway filesystem | PostgreSQL (Railway managed DB) |
| Single Railway service | Multiple services (API, worker, webhook) |
| No CDN | Vercel Edge Network (already included) |
| Single region | Multi-region Railway deployment |

Contact the development team when:
- Monthly active users > 10,000
- Daily transactions > 1,000
- Database size > 100MB

---

## Support

- **Email**: info@omnidrive.co.ke
- **Repository**: github.com/OmniDrive/omnidrive
- **Documentation**: docs.omnidrive.co.ke

---

**Last updated**: 2025-04-23
