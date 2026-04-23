# 🚗 OmniDrive - Production Deployment Summary

**Project**: OmniDrive.co.ke - Kenya's Premier Vehicle Marketplace  
**Status**: Ready for Production Deployment  
**Date**: 2025-04-23  
**Version**: 1.0.0

---

## 📁 Project Structure

```
THE-DEALERSHIP/
├── OmniDrive-dealership/         # Frontend (HTML/CSS/JS - PWA)
│   ├── index.html               # Main application
│   ├── script.js                # All JavaScript logic
│   ├── styles.css               # Complete styling
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                    # Service Worker (offline)
│   ├── server.js                # Backend API (can serve both)
│   ├── package.json             # Node dependencies
│   └── vercel.json              # Vercel deployment config
│
├── OmniDrive-backend/            # Backend API (Express.js)
│   ├── server.js                # Main server with all endpoints
│   ├── daraja.js                # MPesa Daraja integration
│   ├── railway.toml             # Railway deployment config
│   ├── package.json             # Dependencies
│   └── .env.example             # Environment template
│
└── OmniDrive/OmniDrive-mobile/   # Mobile App (React Native/Expo)
    ├── App.js                   # Entry point
    ├── src/services/api.js      # API client (production-ready)
    ├── src/screens/             # All screens
    ├── src/navigation/          # Navigation config
    └── package.json             # Expo dependencies
```

---

## 🚀 Quick Deploy (3 Commands)

### Backend (Railway)

```bash
cd OmniDrive-backend
railway login
railway up
```

After deploy, get URL:
```bash
railway status
# Note: https://omnidrive-backend-production.up.railway.app
```

### Frontend (Vercel)

```bash
cd ../OmniDrive-dealership
vercel --build-env BACKEND_URL=https://your-railway-backend.up.railway.app --yes
```

After deploy, get URL:
```bash
vercel ls
# Note: https://omnidrive-dealership.vercel.app
```

### Mobile (Expo)

```bash
cd ../../OmniDrive/OmniDrive-mobile
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## 🔑 Environment Variables

### Backend (Set in Railway Dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MPESA_CONSUMER_KEY` | Safaricom consumer key | `...` |
| `MPESA_CONSUMER_SECRET` | Safaricom consumer secret | `...` |
| `MPESA_SHORTCODE` | Business shortcode | `174379` (sandbox) |
| `MPESA_PASSKEY` | Safaricom passkey | `bfb279f9...` |
| `MPESA_CALLBACK_URL` | Public callback URL | `https://api.omnidrive.co.ke/api/mpesa/callback` |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | Email port | `587` |
| `SMTP_USER` | Gmail address | `you@gmail.com` |
| `SMTP_PASS` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `ADMIN_KEY` | Admin dashboard auth | `0a6c6a66849b6d29feea4b4381bd4742...` |
| `VAPID_PUBLIC` | Push notifications (auto-generated if empty) | |
| `VAPID_PRIVATE` | Push notifications (auto-generated if empty) | |

### Frontend (Set in Vercel Dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_URL` | Production backend API | `https://api.omnidrive.co.ke` |

---

## 📋 Deployment Checklist

### Phase 1: Infrastructure
- [ ] Railway account created
- [ ] Vercel account created
- [ ] Expo account created (for mobile)
- [ ] Domain registered (omnidrive.co.ke)
- [ ] Safaricom Daraja developer account

### Phase 2: Backend
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Navigate to `OmniDrive-backend/`
- [ ] Initialize project: `railway init` → name: `omnidrive-backend`
- [ ] Set environment variables in Railway dashboard
- [ ] Deploy: `railway up`
- [ ] Verify health: `curl https://your-backend.up.railway.app/`
- [ ] Get and note backend URL

### Phase 3: Frontend
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Navigate to `OmniDrive-dealership/`
- [ ] Deploy: `vercel --build-env BACKEND_URL=https://your-backend-url --yes`
- [ ] Verify site loads
- [ ] (Optional) Add custom domain in Vercel settings
- [ ] Note frontend URL

### Phase 4: CORS Configuration
- [ ] Update `OmniDrive-backend/server.js` CORS origins
- [ ] Add production frontend URL
- [ ] Commit and push to redeploy backend
- [ ] Verify CORS not blocking requests

### Phase 5: MPesa Integration
- [ ] Apply for Safaricom production access (Go Live)
- [ ] Wait for approval (1-3 days)
- [ ] Update Railway env vars with production credentials
- [ ] Update `MPESA_CALLBACK_URL` to production domain
- [ ] Test with real MPesa payment

### Phase 6: Mobile App
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Navigate to `OmniDrive/OmniDrive-mobile/`
- [ ] Build Android: `eas build --platform android --profile production`
- [ ] Build iOS: `eas build --platform ios --profile production`
- [ ] Download AAB/IPA files
- [ ] Submit to Play Store & App Store
- [ ] Wait for review (1-3 days)

### Phase 7: Domain Setup
- [ ] Point `omnidrive.co.ke` A record → Vercel IP
- [ ] Point `www.omnidrive.co.ke` → Vercel
- [ ] Point `api.omnidrive.co.ke` CNAME → Railway URL
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Test all endpoints with custom domain
- [ ] Update env vars to use custom domains

### Phase 8: Testing
- [ ] Browse vehicles: ✓
- [ ] Search/filter: ✓
- [ ] Add to wishlist: ✓
- [ ] Compare vehicles: ✓
- [ ] Test drive booking: ✓
- [ ] MPesa payment (sandbox): ✓
- [ ] Order tracking: ✓
- [ ] Dealer registration: ✓
- [ ] Admin dashboard login: ✓
- [ ] Chat/messaging: ✓
- [ ] Newsletter signup: ✓
- [ ] Mobile app connectivity: ✓
- [ ] PWA install prompt: ✓

### Phase 9: Go Live
- [ ] Switch MPesa to production credentials
- [ ] Enable live payments
- [ ] Announce launch on social media
- [ ] Monitor Railway/Vercel dashboards
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Create backup strategy for database

---

## 🔐 Security Checklist

### Backend
- [x] Helmet security headers enabled
- [x] Rate limiting (60 req/min general, 5/min MPesa)
- [x] CORS whitelist configured
- [x] Environment variables for secrets
- [x] SQL injection prevention (parameterized queries)
- [x] Input validation on all endpoints

### Frontend
- [x] CSP meta tag set
- [x] HTTPS enforced (via hosting)
- [x] No sensitive data in localStorage
- [x] Sanitize user inputs before rendering

### Mobile
- [x] HTTPS API endpoints only
- [x] Secure storage for tokens (if added)
- [x] Certificate pinning optional

---

## 📊 Monitoring

### Railway (Backend)
- Logs: `railway logs --tail`
- Metrics: Railway dashboard → Metrics
- Alerts: Set up in Railway → Alerts
- Database: `railway download omnidrive.db` for backup

### Vercel (Frontend)
- Analytics: Vercel dashboard → Analytics
- Functions: Vercel → Functions → Logs
- Errors: Vercel → Observability → Errors

### Mobile
- Expo Application Services dashboard
- Google Play Console (crash reports)
- Apple App Store Connect (Metrics)

---

## 💾 Database Schema

### Tables Created (Auto)

```sql
-- Orders / Transactions
orders (id, checkout_id, merchant_id, phone, amount, vehicle_id, vehicle_name, status, receipt, customer_email, created_at, updated_at)

-- Dealer Applications
dealer_applications (id, name, owner, phone, email, city, address, types, plan, about, payment, status, created_at)

-- Pending Listings
pending_listings (id, listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller_name, seller_phone, seller_email, status, created_at)

-- Chat System
chat_users, chat_rooms, chat_room_members, chat_messages, chat_reads, chat_presence, push_subscriptions, msg_read_receipts

-- Push Tokens
push_tokens (id, token, user_email, created_at)
```

**Storage**: SQLite (`omnidrive.db`) on Railway filesystem  
**Backup**: Regular `railway download omnidrive.db` or automated script

---

## 🔄 Update Procedures

### Update Backend

```bash
cd OmniDrive-backend

# Make changes to server.js or add files
git add .
git commit -m "Update description"
git push origin main

# Railway auto-deploys on git push
# Or manually:
railway up
```

### Update Frontend

```bash
cd OmniDrive-dealership

# Make changes
git add .
git commit -m "Update UI"
git push origin main

# Vercel auto-deploys on git push (if connected)
# Or manually:
vercel --prod
```

### Update Mobile

```bash
cd OmniDrive/OmniDrive-mobile

# Bump version in app.json
# Make changes
eas update --profile production
```

---

## 🆘 Troubleshooting

### "Backend URL not reachable"
- Check Railway project is running: `railway status`
- Verify `PORT` env var set to `3000`
- Check logs: `railway logs --tail`

### "MPesa callback not working"
- Verify callback URL in Safaricom dashboard matches `MPESA_CALLBACK_URL`
- Check CORS includes frontend domain
- Look for 404s in Railway logs

### "Frontend shows connection error"
- Update `.env` or Vercel env var `BACKEND_URL`
- Redeploy: `vercel --prod`
- Check browser console for CORS errors

### "Database locked or errors"
- Railway filesystem may have issues; consider upgrading to PostgreSQL
- Backup and recreate DB if corrupted: `railway download omnidrive.db`

### "Mobile app shows white screen"
- Clear Expo Go cache
- Check API_BASE URL is correct
- Verify SSL certificate (production URLs must use HTTPS)

---

## 📞 Support Contacts

- **Technical**: tech@omnidrive.co.ke
- **Business**: info@omnidrive.co.ke
- **Safaricom Developer Support**: developer@safaricom.co.ke

---

## 📄 License

Proprietary - OmniDrive 2025

---

**Document Version**: 1.0  
**Last Updated**: April 23, 2025  
**Maintained By**: OmniDrive Engineering Team
