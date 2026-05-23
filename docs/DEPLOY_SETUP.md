# 🚀 OmniDrive Production Deployment Setup

## Status: Configuration Complete - Ready to Deploy

---

## 📋 What's Been Configured

### ✅ Server (Phase 1 Applied)
- `server.js` now includes `server-improved.js` features:
  - Winston structured logging
  - Zod validation
  - Sentry error tracking
  - Swagger API docs
  - Database optimization
  - Request logging
  - Response normalization

### ✅ Environment (`.env`)
- `NODE_ENV=production`
- `PORT=3000`
- MPesa sandbox credentials configured
- SMTP email configured
- Admin key set

### ✅ Railway Config (`railway.toml`)
- Builder: NIXPACKS
- Start: `node server.js`
- Auto-restart on failure

### ✅ Vercel Config (`vercel.json`)
- Static file hosting
- SPA routing
- Clean URLs

---

## 🚀 Deployment Commands

### Option 1: Railway (Recommended - Backend)
```bash
# 1. Login to Railway (requires browser)
railway login

# 2. Link project
railway link --name omnidrive-api

# 3. Deploy
railway up

# Or deploy with token (if available):
# RAILWAY_TOKEN=<token> railway up --service-name omnidrive-api
```

### Option 2: Vercel (Frontend)
```bash
# 1. Login to Vercel
vercel login

# 2. Link project
vercel --prod

# Or with token:
# VERCEL_TOKEN=<token> vercel --prod --token $VERCEL_TOKEN
```

### Option 3: Docker (Self-Hosted)
```bash
# Build
docker build -t omnidrive .

# Run
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  omnidrive
```

### Option 4: Node.js Direct (Manual)
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
npm install
node server.js
```

---

## 🔑 Required Tokens/Keys

### For Railway Deployment:
- `RAILWAY_TOKEN` - Get from https://railway.app/account

### For Vercel Deployment:
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens

### For Safaricom Production:
- `MPESA_CONSUMER_KEY` (production)
- `MPESA_CONSUMER_SECRET` (production)
- `MPESA_SHORTCODE` (production)
- `MPESA_PASSKEY` (production)

### For Email:
- `SMTP_PASS` - Gmail App Password

### For Admin:
- `ADMIN_KEY` - Generate with: `openssl rand -hex 32`

---

## 📦 Production Environment Variables

Update `.env` before production:

```bash
# Safaricom Production Keys
MPESA_CONSUMER_KEY=<production-key>
MPESA_CONSUMER_SECRET=<production-secret>
MPESA_SHORTCODE=<production-shortcode>
MPESA_PASSKEY=<production-passkey>
MPESA_CALLBACK_URL=https://api.omnidrive.co.ke/api/mpesa/callback

# Server
PORT=3000
NODE_ENV=production

# Email
SMTP_USER=admin@omnidrive.co.ke
SMTP_PASS=<your-app-password>

# Admin (generate new!)
ADMIN_KEY=<generate-new-key>
```

---

## 🌐 Domain Configuration

### Custom Domain Setup:

1. **Buy Domain**: omnidrive.co.ke
2. **Configure DNS**:
   ```
   Type    Name    Value
   A       @       <Vercel-IP>
   CNAME   www     cname.vercel-dns.com
   CNAME   api     <railway-url>.up.railway.app
   ```
3. **Add to Vercel**: Dashboard → Domains → Add
4. **Add to Railway**: Settings → Domains → Add
5. **Update Callback**: `MPESA_CALLBACK_URL=https://api.omnidrive.co.ke/api/mpesa/callback`

---

## 🔒 Pre-Deployment Checklist

- [ ] Run tests: `npm test` (all passing)
- [ ] Update `.env` with production keys
- [ ] Generate new admin key: `openssl rand -hex 32`
- [ ] Backup database: `railway download omnidrive.db`
- [ ] Configure Railway token
- [ ] Configure Vercel token
- [ ] Set up domain DNS (if using)
- [ ] Submit Safaricom Go-Live
- [ ] Configure monitoring (Sentry)
- [ ] Set up log rotation
- [ ] Configure database backups
- [ ] Test payment flow (sandbox)
- [ ] Verify email sending
- [ ] Check all API endpoints
- [ ] Load test (optional)

---

## 🚦 Deployment Steps

### Step 1: Backend (Railway)
```bash
# Set Railway token
export RAILWAY_TOKEN=<your-token>

# Deploy
cd /home/james-nzuki/development/PERSONAL-PROJECTS/OmniDrive
railway up --service-name omnidrive-api

# Monitor
railway logs --tail
```

### Step 2: Frontend (Vercel)
```bash
# Set Vercel token
export VERCEL_TOKEN=<your-token>

# Deploy
vercel --prod --token $VERCEL_TOKEN
```

### Step 3: Safaricom Go-Live
1. Login: https://developer.safaricom.co.ke
2. My Apps → OmniDrive
3. Click **Go Live**
4. Fill business details
5. Wait 1-3 days for approval

### Step 4: Update to Production
```bash
# Update callback URL
# Update .env MPesa keys to production
# Redeploy
railway up
```

---

## 📊 Monitoring

### Sentry (Error Tracking)
- Dashboard: https://sentry.io
- Monitor: Errors, performance, releases

### Railway (Logs)
```bash
railway logs --tail
```

### Application Logs
```bash
tail -f logs/error.log
tail -f logs/combined.log
```

---

## 🔄 Rollback Plan

If deployment fails:

```bash
# Railway rollback
railway rollback

# Or redeploy previous version
railway up --force

# Database backup restore
railway download omnidrive.db
# Restore to previous backup
```

---

## ✅ Success Criteria

- [ ] Application accessible at domain
- [ ] All API endpoints responding
- [ ] Login works
- [ ] MPesa payments working
- [ ] Emails sending
- [ ] No errors in logs
- [ ] Database backed up
- [ ] Monitoring configured

---

## 🎉 Deployment Complete!

**Access Application:** https://omnidrive.co.ke  
**API Endpoint:** https://api.omnidrive.co.ke  
**Admin Panel:** https://omnidrive.co.ke/admin.html

---

**Support:**  
- Sentry: Error tracking  
- Logs: `railway logs --tail`  
- Docs: See README.md  

</br>
<center>
  <h2>🚀 OmniDrive is LIVE! 🚀</h2>
</center>

