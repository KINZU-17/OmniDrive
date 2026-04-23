# 🚀 OmniDrive Quick Deploy Guide

**Turn your OmniDrive project into a live application in 10 minutes**

---

## 📦 What's Included

✅ **Full-featured backend** (Node.js + Express + SQLite)  
✅ **Modern frontend** (HTML5, CSS3, Vanilla JS - PWA)  
✅ **Mobile app** (React Native/Expo)  
✅ **MPesa integration** (Safaricom Daraja)  
✅ **Admin dashboard** + dealer registration  
✅ **Real-time chat** + push notifications  
✅ **Email notifications** + order tracking  

---

## 🎯 One-Command Deploy

### Option A: Automated (Recommended)

```bash
# From project root
./DEPLOY_ALL.sh
```

This script will:
1. Install Railway CLI
2. Deploy backend to Railway
3. Configure frontend for production
4. Initialize Vercel deployment
5. Print next steps

### Option B: Manual Step-by-Step

#### 1. Backend (Railway) – 5 min

```bash
cd OmniDrive-backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

After deployment, note your backend URL:
```bash
railway status  # Shows "Public URL"
```

#### 2. Frontend (Vercel) – 3 min

```bash
cd ../OmniDrive-dealership

# Replace BACKEND_URL in script.js with your Railway URL
# Or use build env var:

vercel --build-env BACKEND_URL=https://your-railway-backend.up.railway.app --yes
```

Frontend live at: `https://omnidrive-dealership.vercel.app` (or custom domain)

#### 3. Mobile (Expo) – 5 min

```bash
cd ../../OmniDrive/OmniDrive-mobile

# Build production APK/IPA
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## 🔧 Configuration Checklist

### Railway Environment Variables

Set in Railway Dashboard → Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `3000` | Auto-set |
| `MPESA_CONSUMER_KEY` | From Safaricom | For payments |
| `MPESA_CONSUMER_SECRET` | From Safaricom | For payments |
| `MPESA_SHORTCODE` | Your shortcode | For payments |
| `MPESA_PASSKEY` | Your passkey | For payments |
| `MPESA_CALLBACK_URL` | `https://api.omnidrive.co.ke/api/mpesa/callback` | For payments |
| `SMTP_USER` | Gmail address | For emails |
| `SMTP_PASS` | Gmail App Password | For emails |
| `ADMIN_KEY` | Random 64-char hex | For admin access |

**Get MPesa credentials**: [developer.safaricom.co.ke](https://developer.safaricom.co.ke)

### Vercel Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `BACKEND_URL` | Your Railway backend URL |

---

## 🎨 Custom Domain (Optional)

### Point omnidrive.co.ke to Vercel

**A Record** (at your domain registrar):
```
Type: A
Name: @
Value: 76.76.21.21   (Vercel's IP - check dashboard)
```

**CNAME**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**CNAME for API**:
```
Type: CNAME
Name: api
Value: your-backend.up.railway.app
```

---

## ✅ Test Deployment

After deploying, verify:

```bash
# 1. Health check
curl https://your-backend.up.railway.app/

# Expected: {"status":"OmniDrive Backend Running","version":"1.0.0",...}

# 2. Get listings
curl https://your-backend.up.railway.app/api/listings

# 3. Test MPesa (sandbox)
curl -X POST https://your-backend.up.railway.app/api/mpesa/purchase \
  -H "Content-Type: application/json" \
  -d '{"phone":"254712000000","amount":1,"vehicleName":"Test Car","vehicleId":"123"}'

# 4. Open frontend in browser
# Should see OmniDrive homepage with vehicle inventory
```

---

## 🔐 Safaricom Go-Live

1. **Sandbox Testing** – Use sandbox credentials (already in .env)
2. **Apply for Production** – In Safaricom Developer Portal:
   - Go to My Apps → Select your app
   - Click "Go Live"
   - Fill business details
   - Wait 1-3 business days
3. **Update Credentials** – Replace sandbox keys with production keys in Railway env
4. **Switch Mode** – Set `NODE_ENV=production` (already set)

**Important**: In production, real money moves. In sandbox, amount locked to KES 1.

---

## 📱 Mobile App Updates

The mobile app points to `https://api.omnidrive.co.ke`. Update this when you have your custom domain:

**File**: `OmniDrive/OmniDrive-mobile/src/services/api.js`

```javascript
const BACKEND_URL = __DEV__
    ? 'http://localhost:3000'
    : 'https://api.omnidrive.co.ke';  // Change to your domain
```

Then rebuild:
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## 🛠️ Local Development

### Backend (localhost:3000)

```bash
cd OmniDrive-backend
npm install
cp .env.example .env  # Edit .env with your credentials
npm run dev  # Runs with nodemon
```

### Frontend (localhost:5500)

```bash
cd OmniDrive-dealership
# Just open index.html in browser, or use a local server:
npx serve .
```

Frontend auto-connects to backend based on hostname detection.

---

## 📊 What Gets Deployed Where

| Component | Location | Technology | Host |
|-----------|----------|------------|------|
| Backend API | `OmniDrive-backend/` | Node.js + Express | Railway |
| Frontend | `OmniDrive-dealership/` | HTML/CSS/JS | Served by backend OR Vercel |
| Mobile App | `OmniDrive-mobile/` | React Native/Expo | EAS Build → Play Store/App Store |

**Note**: Backend serves frontend files automatically via `express.static()`. Deploying to Railway alone gives you both API and website at the same URL. Deploying to Vercel is optional (better CDN).

---

## 🔍 Troubleshooting

### "Cannot find module 'better-sqlite3'"
```bash
cd OmniDrive-dealership
npm install --production
```

### "Database is locked"
Railway filesystem is read-only in some plans. Use SQLite on writable partition or upgrade to Railway PostgreSQL.

### "MPesa callback 404"
- Verify callback URL in Safaricom matches `MPESA_CALLBACK_URL`
- Add production domain to CORS in `server.js`

### "Frontend shows blank page"
- Check `BACKEND_URL` in script.js or Vercel env
- Open browser console for errors
- Ensure static files are being served

### "Build fails on Railway"
Ensure `package.json` exists and has `start` script:
```json
"scripts": {
  "start": "node server.js"
}
```

---

## 📚 Documentation

- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Architecture & vision: `VISION.md`
- Project README: `OmniDrive-dealership/README.md`
- Backend README: `OmniDrive-backend/README.md`

---

## 💡 Need Help?

- **Email**: info@omnidrive.co.ke
- **GitHub Issues**: Report bugs/features
- **Safaricom Support**: developer@safaricom.co.ke

---

**Ready to launch?** Run `./DEPLOY_ALL.sh` and follow the prompts! 🚀
