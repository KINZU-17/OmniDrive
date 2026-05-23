# OmniDrive Deployment Guide

## 1. Custom Domain (omnidrive.co.ke → Railway)

1. Go to [railway.app](https://railway.app) → your OmniDrive backend service
2. Click **Settings** → **Domains** → **Add Custom Domain**
3. Enter: `api.omnidrive.co.ke`
4. Railway will give you a CNAME record, e.g. `abc123.up.railway.app`
5. Go to your domain registrar (where you bought omnidrive.co.ke)
6. Add a **CNAME record**:
   - Name: `api`
   - Value: `abc123.up.railway.app`
7. For the main site (if hosting on Railway too), add:
   - Name: `@` or `www`
   - Value: the Railway CNAME
8. Wait 5–30 minutes for DNS propagation
9. Update `BACKEND_URL` in `script.js` and `src/services/api.js` to `https://api.omnidrive.co.ke`

---

## 2. Safaricom MPesa Go-Live

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Login → **My Apps** → select OmniDrive app
3. Click **Go Live** / **Production Access**
4. Fill in the business details form:
   - Business name: OmniDrive
   - Business type: E-commerce
   - Callback URL: `https://api.omnidrive.co.ke/api/mpesa/callback`
5. Submit and wait for approval (1–3 business days)
6. Once approved, you'll get **production** Consumer Key & Secret
7. Update Railway environment variables:
   - `MPESA_CONSUMER_KEY` = new production key
   - `MPESA_CONSUMER_SECRET` = new production secret
   - `MPESA_SHORTCODE` = your production shortcode (from Safaricom)
   - `MPESA_PASSKEY` = your production passkey
   - `MPESA_CALLBACK_URL` = `https://api.omnidrive.co.ke/api/mpesa/callback`
   - `NODE_ENV` = `production`

---

## 3. Play Store Publishing

### Prerequisites
- Google Play Developer account ($25 one-time fee) at [play.google.com/console](https://play.google.com/console)
- EAS CLI: `npm install -g eas-cli`
- Login: `eas login` (use your Expo account)

### Build for Play Store
```bash
cd OmniDrive-mobile
eas build --platform android --profile production
```
This uploads to Expo's build servers and produces an `.aab` file.

### Submit to Play Store
1. Download the `.aab` from the EAS dashboard
2. Go to Play Console → **Create app**
3. Fill in app details:
   - App name: OmniDrive
   - Category: Shopping
   - Description: Kenya's premier vehicle marketplace
4. Upload the `.aab` under **Production** → **Releases**
5. Add screenshots (use `npx expo start` + emulator to capture)
6. Submit for review (usually 1–3 days)

### Auto-submit (after first manual upload)
```bash
eas submit --platform android --profile production
```

---

## 4. iOS App Store (future)

- Requires Apple Developer account ($99/year)
- Build: `eas build --platform ios --profile production`
- Submit: `eas submit --platform ios`

---

## 5. Push Notifications — Send from Admin

Use the backend API to send push notifications to all users:

```bash
curl -X POST https://api.omnidrive.co.ke/api/push/send \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": "🔥 Hot Deal Alert!",
    "body": "Toyota Land Cruiser 300 just dropped to $89,000",
    "data": { "vehicleId": 120 }
  }'
```

---

## Environment Variables (Railway)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MPESA_CONSUMER_KEY` | from Safaricom production |
| `MPESA_CONSUMER_SECRET` | from Safaricom production |
| `MPESA_SHORTCODE` | production shortcode |
| `MPESA_PASSKEY` | production passkey |
| `MPESA_CALLBACK_URL` | `https://api.omnidrive.co.ke/api/mpesa/callback` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail |
| `SMTP_PASS` | Gmail app password |
| `ADMIN_KEY` | your strong random key |
