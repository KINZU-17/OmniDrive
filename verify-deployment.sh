#!/bin/bash

# OmniDrive Pre-Deployment Verification Script
# Checks that all files are in place and properly configured

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "🔍 OmniDrive Pre-Deployment Check"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# ── Check directory structure ────────────────────────────────────────────────
echo "📁 Checking directory structure..."

REQUIRED_DIRS=(
    "OmniDrive-dealership"
    "OmniDrive-backend"
    "OmniDrive-mobile"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir/"
    else
        echo -e "  ${RED}✗${NC} $dir/ MISSING"
        ((ERRORS++))
    fi
done

echo ""

# ── Check critical files ─────────────────────────────────────────────────────
echo "📄 Checking critical files..."

REQUIRED_FILES=(
    "OmniDrive-dealership/server.js"
    "OmniDrive-dealership/index.html"
    "OmniDrive-dealership/script.js"
    "OmniDrive-dealership/styles.css"
    "OmniDrive-dealership/package.json"
    "OmniDrive-backend/daraja.js"
    "OmniDrive-backend/package.json"
    "OmniDrive-backend/railway.toml"
    "OmniDrive-mobile/App.js"
    "OmniDrive-mobile/src/services/api.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file MISSING"
        ((ERRORS++))
    fi
done

echo ""

# ── Check dependencies ───────────────────────────────────────────────────────
echo "📦 Checking dependencies..."

if [ -d "OmniDrive-dealership/node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} OmniDrive-dealership/node_modules exists"
else
    echo -e "  ${YELLOW}!${NC} node_modules missing - run 'npm install' in OmniDrive-dealership/"
    ((WARNINGS++))
fi

if [ -d "OmniDrive-backend/node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} OmniDrive-backend/node_modules exists"
else
    echo -e "  ${YELLOW}!${NC} node_modules missing - run 'npm install' in OmniDrive-backend/"
    ((WARNINGS++))
fi

echo ""

# ── Check environment variables ──────────────────────────────────────────────
echo "🔐 Checking environment configuration..."

if [ -f "OmniDrive-dealership/.env" ]; then
    echo -e "  ${GREEN}✓${NC} OmniDrive-dealership/.env exists"

    # Check for placeholder values
    if grep -q "your_consumer_key_here" "OmniDrive-dealership/.env" 2>/dev/null; then
        echo -e "  ${YELLOW}!${NC} .env contains placeholder values - update with real credentials"
        ((WARNINGS++))
    fi
else
    echo -e "  ${YELLOW}!${NC} OmniDrive-dealership/.env not found - copy from .env.example"
    ((WARNINGS++))
fi

if [ ! -f "OmniDrive-backend/.env" ]; then
    echo -e "  ${YELLOW}!${NC} OmniDrive-backend/.env missing - copy from .env.example"
    ((WARNINGS++))
fi

echo ""

# ── Verify API endpoint consistency ──────────────────────────────────────────
echo "🔗 Checking API endpoint consistency..."

# Extract BACKEND_URL from frontend script
BACKEND_URL_IN_FRONTEND=$(grep "BACKEND_URL" "OmniDrive-dealership/script.js" | head -1 | sed "s/.*return '//;s/'.*//" 2>/dev/null || echo "")

if [ -n "$BACKEND_URL_IN_FRONTEND" ]; then
    echo -e "  Frontend backend URL: $BACKEND_URL_IN_FRONTEND"
else
    echo -e "  ${YELLOW}!${NC} Could not extract BACKEND_URL from script.js"
    ((WARNINGS++))
fi

# Check that frontend script uses expected endpoints
REQUIRED_ENDPOINTS=(
    "/api/listings"
    "/api/mpesa/purchase"
    "/api/mpesa/status/"
    "/api/listings/submit"
)

for endpoint in "${REQUIRED_ENDPOINTS[@]}"; do
    if grep -q "$endpoint" "OmniDrive-dealership/script.js"; then
        echo -e "  ${GREEN}✓${NC} Uses endpoint: $endpoint"
    else
        echo -e "  ${YELLOW}!${NC} Endpoint not found in frontend: $endpoint"
        ((WARNINGS++))
    fi
done

echo ""

# ── Verify backend has all required routes ────────────────────────────────────
echo "🛠️  Checking backend routes..."

BACKEND_ROUTES=(
    "GET /"
    "POST /api/mpesa/purchase"
    "POST /api/mpesa/callback"
    "GET /api/mpesa/status"
    "POST /api/listings/submit"
    "GET /api/listings"
)

for route in "${BACKEND_ROUTES[@]}"; do
    # Convert to pattern for grep
    pattern=$(echo "$route" | sed 's/ /.*/')
    if grep -Eiq "$pattern" "OmniDrive-dealership/server.js"; then
        echo -e "  ${GREEN}✓${NC} Route exists: $route"
    else
        echo -e "  ${RED}✗${NC} Route missing: $route"
        ((ERRORS++))
    fi
done

echo ""

# ── Check deployment files ────────────────────────────────────────────────────
echo "🚀 Checking deployment configuration..."

DEPLOY_FILES=(
    "DEPLOY_ALL.sh"
    "DEPLOY_BACKEND_RAILWAY.sh"
    "DEPLOYMENT_GUIDE.md"
    "DEPLOYMENT_SUMMARY.md"
    "QUICKSTART.md"
    "DEPLOY_PLAN.md"
)

for file in "${DEPLOY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${YELLOW}!${NC} $file not found"
        ((WARNINGS++))
    fi
done

echo ""

# ── Summary ───────────────────────────────────────────────────────────────────
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "You can now deploy:"
    echo "  ./DEPLOY_ALL.sh"
    echo ""
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) - review above${NC}"
    fi
else
    echo -e "${RED}❌ $ERRORS error(s) found - fix before deploying${NC}"
    exit 1
fi

echo ""
echo "Happy deploying! 🚗💨"
