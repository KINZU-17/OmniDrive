# ✅ Deployment Readiness Checklist

## Before You Deploy

### Code Quality
- [x] Backend has SQLite database with proper schema
- [x] Backend has CORS configuration
- [x] Backend has rate limiting
- [x] Backend has Helmet security headers
- [x] Backend serves static frontend files
- [x] Frontend uses environment variable for backend URL
- [x] Mobile app uses production URL
- [x] All API endpoints match between frontend and backend

### Documentation
- [x] Deployment scripts created
- [x] Environment variable templates created
- [x] Comprehensive guides written
- [x] Quick start guide created

### Configuration
- [x] Railway config (railway.toml) ready
- [x] Vercel config (vercel.json) ready
- [x] .env.example updated
- [x] Dockerfile exists (in dealership folder)

---

## Deployment Actions (User Must Complete)

### ☐ Step 1: Railway Account
- [ ] Create account at [railway.app](https://railway.app)
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`

### ☐ Step 2: Deploy Backend
- [ ] Navigate to `OmniDrive-dealership/`
- [ ] Run: `railway init` → name: `omnidrive-api`
- [ ] Run: `railway up`
- [ ] Wait for deployment (monitor: `railway logs --tail`)
- [ ] Get backend URL from `railway status`

### ☐ Step 3: Set Railway Environment Variables

Go to Railway dashboard → Your project → Variables:

```
NODE_ENV=production
MPESA_CONSUMER_KEY=<from Safaricom>
MPESA_CONSUMER_SECRET=<from Safaricom>
MPESA_SHORTCODE=174379 (sandbox) or your prod shortcode
MPESA_PASSKEY=<from Safaricom>
MPESA_CALLBACK_URL=https://your-domain/api/mpesa/callback  (will update later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_KEY=<generate: openssl rand -hex 32>
```

**Important**: Initially set `MPESA_CALLBACK_URL` to your Railway URL. Update later with custom domain.

### ☐ Step 4: Test Backend

```bash
curl https://your-railway-backend.up.railway.app/
# Should return JSON with status "OmniDrive Backend Running"

curl https://your-railway-backend.up.railway.app/api/listings
# Should return array of vehicles (empty initially, populate via admin)
```

### ☐ Step 5: Deploy Frontend (Optional but Recommended)

```bash
cd OmniDrive-dealership
vercel login
vercel --build-env BACKEND_URL=https://your-railway-backend.up.railway.app --yes
```

Note frontend URL (e.g., `https://omnidrive-dealership.vercel.app`).

### ☐ Step 6: Configure Custom Domain (Optional)

**A. Buy domain** (if not already): `omnidrive.co.ke`

**B. DNS Records** (at registrar):

| Type | Name | Value |
|------|------|-------|
| A | @ | Vercel IP (from Vercel dashboard) |
| CNAME | www | `cname.vercel-dns.com` |
| CNAME | api | `your-backend.up.railway.app` |

**C. Add to Vercel**: Domain → Add → `omnidrive.co.ke`

**D. Add to Railway**: No action needed ( Railway public URL works as-is)

**E. Wait** 5-30 min for DNS

### ☐ Step 7: Update Configuration with Custom Domain

After DNS propagates:

**Railway** → Variables:
```
MPESA_CALLBACK_URL=https://api.omnidrive.co.ke/api/mpesa/callback
BACKEND_URL=https://api.omnidrive.co.ke (if needed)
```

**Vercel** → Environment Variables:
```
BACKEND_URL=https://api.omnidrive.co.ke
```

Redeploy both to pick up changes:
```bash
# Railway
cd OmniDrive-dealership
railway up

# Vercel
cd same
vercel --prod
```

### ☐ Step 8: Safaricom Production Go-Live

1. Log into [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Go to **My Apps** → Select OmniDrive
3. Click **Go Live**
4. Fill business details:
   - Business Name: OmniDrive
   - Type: E-commerce
   - Callback URL: `https://api.omnidrive.co.ke/api/mpesa/callback`
5. Wait for approval (1-3 business days)

### ☐ Step 9: Update MPesa Credentials

After approval, get production keys from Safaricom.

Update Railway variables:
```
MPESA_CONSUMER_KEY=<production key>
MPESA_CONSUMER_SECRET=<production secret>
MPESA_SHORTCODE=<production shortcode>
MPESA_PASSKEY=<production passkey>
MPESA_CALLBACK_URL=https://api.omnidrive.co.ke/api/mpesa/callback
NODE_ENV=production
```

### ☐ Step 10: Add Inventory

**Option A: Admin Dashboard**
1. Visit `https://omnidrive.co.ke/admin.html`
2. Login with admin key (from .env)
3. Add vehicles manually

**Option B: Database Direct** (for bulk import)
```bash
railway download omnidrive.db
# Edit with SQLite browser
railway up (re-upload)
```

### ☐ Step 11: Mobile App

Update `BACKEND_URL` in mobile app to production:
```javascript
const BACKEND_URL = 'https://api.omnidrive.co.ke';
```

Build & submit:
```bash
cd OmniDrive/OmniDrive-mobile
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

### ☐ Step 12: Testing

**Functional Tests:**
- [ ] Homepage loads
- [ ] Search/filter vehicles
- [ ] Vehicle detail modal opens
- [ ] Add to wishlist works
- [ ] Compare 3 vehicles
- [ ] Financing calculator accurate
- [ ] Test drive form submits
- [ ] Dealer registration form submits
- [ ] Newsletter signup works
- [ ] Admin login works
- [ ] Add new vehicle via admin
- [ ] MPesa payment (sandbox) initiates
- [ ] Callback updates order status
- [ ] Order tracking shows timeline
- [ ] VIN check page loads
- [ ] Chat login & messaging works
- [ ] Push notifications receive (mobile)

**Cross-browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Responsive:**
- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

**Performance:**
- [ ] Page load < 3s
- [ ] Images lazy load
- [ ] PWA install prompt appears

---

## Post-Launch

### Monitoring
- [ ] Set up Railway log monitoring
- [ ] Set up Vercel analytics
- [ ] Add Sentry error tracking
- [ ] Set uptime monitor (UptimeRobot)

### Backups
- [ ] Schedule daily DB backups
- [ ] Script: `railway download omnidrive.db` → S3

### Marketing
- [ ] Submit to Google Search Console
- [ ] Submit sitemap.xml
- [ ] Create social media accounts
- [ ] Announce launch

### Scale Planning
- [ ] Monitor Railway usage (CPU, RAM, bandwidth)
- [ ] If >10K users/month → upgrade Railway plan
- [ ] If DB >100MB → migrate to PostgreSQL

---

## Success Criteria

✅ **Live website**: https://omnidrive.co.ke  
✅ **Live API**: https://api.omnidrive.co.ke  
✅ **MPesa payments working** (tested)  
✅ **Admin dashboard accessible**  
✅ **Mobile app in stores** (or TestFlight/Play Console)  
✅ **SSL certificates valid**  
✅ **No critical errors in logs**  

---

## Support Resources

| Issue | Solution |
|-------|----------|
| Railway deploy fails | Check Node version (>=18), run `railway logs` |
| MPesa callback 404 | Update Safaricom dashboard with correct URL |
| CORS errors | Add frontend domain to CORS list in server.js |
| Database errors | Railway filesystem may be read-only; contact support |
| Mobile app crash | Check API_BASE URL, verify HTTPS |
| Frontend blank | Check BACKEND_URL env var, console for errors |

---

**Once all checkboxes are ticked, OmniDrive is live! 🎉**
