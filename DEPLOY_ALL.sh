# OmniDrive Deployment Script
# This script automates the deployment of OmniDrive to Railway (backend) and Vercel (frontend)

set -e

echo "=========================================="
echo "🚗 OmniDrive Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Step 1: Deploy Backend to Railway
echo "=========================================="
echo "Step 1: Deploying Backend to Railway"
echo "=========================================="
echo ""

# Check if Railway is logged in
if ! railway whoami &> /dev/null; then
    echo "🔑 Logging into Railway..."
    railway login
fi

# Navigate to backend directory
cd /home/james-nzuki/development/PERSONAL-PROJECTS/THE-DEALERSHIP/OmniDrive-backend

# Initialize Railway project if not exists
if [ ! -f railway.toml ]; then
    echo "📝 Creating railway.toml..."
    cat > railway.toml << 'EOF'
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[env]
NODE_ENV="production"
EOF
fi

# Check if project exists
PROJECT_ID=$(railway project list --json 2>/dev/null | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "🚀 Creating new Railway project..."
    railway project init --name "omnidrive-backend"
    PROJECT_ID=$(railway project list --json 2>/dev/null | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
else
    echo "📦 Linking to existing Railway project..."
    railway link $PROJECT_ID
fi

# Deploy
echo "🚀 Deploying to Railway..."
railway up

# Get the deployed URL
echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

BACKEND_URL=$(railway env get RAILWAY_PUBLIC_DOMAIN 2>/dev/null || railway env list --json | grep -o '"value":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect URL. You may need to set a custom domain.${NC}"
    BACKEND_URL="https://omnidrive-backend-production.up.railway.app"
fi

echo -e "${GREEN}✅ Backend deployed to: $BACKEND_URL${NC}"
echo ""

# Step 2: Update Frontend Configuration
echo "=========================================="
echo "Step 2: Updating Frontend Configuration"
echo "=========================================="
echo ""

DEALERSHIP_PATH="/home/james-nzuki/development/PERSONAL-PROJECTS/THE-DEALERSHIP/OmniDrive-dealership"

# Update script.js with production backend URL
echo "🔧 Updating backend URL in script.js..."
sed -i "s|https://omnidrive-backend-production.up.railway.app|$BACKEND_URL|g" "$DEALERSHIP_PATH/script.js"

echo -e "${GREEN}✅ Frontend configured for: $BACKEND_URL${NC}"
echo ""

# Step 3: Deploy Frontend to Vercel
echo "=========================================="
echo "Step 3: Deploying Frontend to Vercel"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

cd "$DEALERSHIP_PATH"

# Check Vercel login
if ! vercel whoami &> /dev/null; then
    echo "🔑 Logging into Vercel..."
    vercel login
fi

# Pull existing project if exists
if [ -f vercel.json ]; then
    echo "📥 Pulling existing Vercel project..."
    vercel pull --yes --environment=production 2>/dev/null || true
fi

# Deploy
echo "🚀 Deploying to Vercel..."
vercel --build-env NODE_ENV=production --yes

# Get Vercel URL
FRONTEND_URL=$(vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="https://omnidrive-dealership.vercel.app"
fi

echo -e "${GREEN}✅ Frontend deployed to: $FRONTEND_URL${NC}"
echo ""

# Step 4: Update Backend CORS
echo "=========================================="
echo "Step 4: Updating Backend CORS Settings"
echo "=========================================="
echo ""

# Update CORS in server.js to include production frontend URL
sed -i "s|https://omnidrive.co.ke|$FRONTEND_URL|g" "/home/james-nzuki/development/PERSONAL-PROJECTS/THE-DEALERSHIP/OmniDrive-backend/server.js"

echo -e "${GREEN}✅ Backend CORS updated${NC}"
echo ""

# Step 5: Summary
echo "=========================================="
echo "🎉 Deployment Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Backend (API):${NC}   $BACKEND_URL"
echo -e "${GREEN}Frontend (Web):${NC} $FRONTEND_URL"
echo ""
echo "🔐 Next Steps:"
echo "1. Update MPesa callback URL at developer.safaricom.co.ke:"
echo "   $BACKEND_URL/api/mpesa/callback"
echo ""
echo "2. Update domain DNS (if using custom domain):"
echo "   - Point omnidrive.co.ke → $FRONTEND_URL"
echo "   - Point api.omnidrive.co.ke → $BACKEND_URL"
echo ""
echo "3. Update production MPesa credentials in Railway dashboard"
echo ""
echo "4. Build and publish mobile app:"
echo "   cd OmniDrive/OmniDrive-mobile && eas build --platform android --profile production"
echo ""
echo "=========================================="
echo "✨ OmniDrive is now live!"
echo "=========================================="
