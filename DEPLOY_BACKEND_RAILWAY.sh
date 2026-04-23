#!/bin/bash

# ─────────────────────────────────────────────────────────────────────────────
# OmniDrive Production Deployment Script
# Deploys backend API and frontend to Railway (single service)
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "=========================================="
echo "🚗 OmniDrive Railway Deployment"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ── Check prerequisites ──────────────────────────────────────────────────────
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 18+ required${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm required${NC}"
    exit 1
fi

if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing Railway CLI...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# ── Login to Railway ─────────────────────────────────────────────────────────
if ! railway whoami &> /dev/null; then
    echo "🔑 Please login to Railway:"
    railway login
fi

# ── Navigate to backend directory (the one with full server.js) ─────────────
BACKEND_DIR="/home/james-nzuki/development/PERSONAL-PROJECTS/THE-DEALERSHIP/OmniDrive-dealership"
cd "$BACKEND_DIR"

echo "📁 Working directory: $BACKEND_DIR"

# ── Install dependencies ──────────────────────────────────────────────────────
echo "📦 Installing dependencies..."
npm install --production

# ── Build (if needed - this project doesn't need build step) ─────────────────
echo "🔨 No build step required (static files already in repo)"

# ── Create railway.toml ───────────────────────────────────────────────────────
cat > railway.toml << 'EOF'
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[env]
NODE_ENV="production"
PORT="3000"
EOF

echo "✅ Created railway.toml"

# ── Initialize Railway project ───────────────────────────────────────────────
echo "🚀 Initializing Railway project..."

if [ ! -f .railway/config.json ]; then
    railway init --name "omnidrive-api" || true
fi

# ── Deploy ────────────────────────────────────────────────────────────────────
echo "⬆️  Deploying to Railway..."
railway up

# ── Get production URL ────────────────────────────────────────────────────────
echo ""
echo "⏳ Waiting for deployment..."
sleep 15

# Try to get the URL multiple ways
BACKEND_URL=$(railway env list --json 2>/dev/null | grep -o '"RAILWAY_PUBLIC_DOMAIN":"[^"]*' | cut -d'"' -f4)
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL=$(railway status 2>/dev/null | grep -i "public url" | awk '{print $NF}' || true)
fi

if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="https://omnidrive-api.up.railway.app"
    echo -e "${YELLOW}⚠️  Could not auto-detect URL. Using default: $BACKEND_URL${NC}"
else
    echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"
fi

# ── Update CORS configuration ────────────────────────────────────────────────
echo ""
echo "🔧 Updating CORS settings..."
# The server.js already includes omnidrive.co.ke; add your Vercel domain if using Vercel
echo "Remember to add your frontend URL to CORS in server.js before going live"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📡 Backend API: $BACKEND_URL"
echo "🔍 Health check:  $BACKEND_URL/"
echo "📋 Listings:      $BACKEND_URL/api/listings"
echo "💳 MPesa:         $BACKEND_URL/api/mpesa/purchase"
echo ""
echo "🔐 Next steps:"
echo "1. Set environment variables in Railway dashboard:"
echo "   - MPESA_CONSUMER_KEY"
echo "   - MPESA_CONSUMER_SECRET"
echo "   - MPESA_SHORTCODE"
echo "   - MPESA_PASSKEY"
echo "   - MPESA_CALLBACK_URL (use $BACKEND_URL/api/mpesa/callback)"
echo "   - SMTP_USER, SMTP_PASS (for emails)"
echo "   - ADMIN_KEY (for admin dashboard)"
echo ""
echo "2. Test the API:"
echo "   curl $BACKEND_URL/"
echo ""
echo "3. Deploy frontend (optional - backend already serves index.html):"
echo "   cd ../../OmniDrive-dealership"
echo "   vercel --build-env BACKEND_URL=$BACKEND_URL --yes"
echo ""
echo "4. Update MPesa credentials at developer.safaricom.co.ke"
echo ""
echo "=========================================="
echo "✨ OmniDrive is live!"
echo "=========================================="
