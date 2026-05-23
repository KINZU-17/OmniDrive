#!/bin/bash
# OmniDrive Start Script
# Usage: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== OmniDrive Startup ==="
echo ""

# Check dependencies
echo "[1/4] Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check if database exists and has data
echo ""
echo "[2/4] Checking database..."
if [ ! -f "omnidrive.db" ]; then
    echo "⚠️  Database not found. Creating and populating..."
    node server.js > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 3
    node populate_db.js
    kill $SERVER_PID 2>/dev/null || true
    sleep 1
    echo "✅ Database populated with 62 vehicles"
else
    COUNT=$(node -e "const d=require('better-sqlite3')('omnidrive.db'); console.log(d.prepare('SELECT COUNT(*) as c FROM listings').get().c);")
    echo "✅ Database exists with $COUNT listings"
fi

# Start backend
echo ""
echo "[3/4] Starting backend server..."
node server.js > /tmp/omni_backend.log 2>&1 &
SERVER_PID=$!
echo "  PID: $SERVER_PID"
sleep 2

if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Backend running on http://localhost:3002"
    echo "  Health: $(curl -s http://localhost:3002/health)"
    LISTINGS=$(curl -s http://localhost:3002/api/listings | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null || echo "N/A")
    echo "  Listings: $LISTINGS"
else
    echo "❌ Backend failed to start"
    cat /tmp/omni_backend.log
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Start frontend server
echo ""
echo "[4/4] Starting frontend server..."
python3 -m http.server 8080 > /tmp/omni_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  PID: $FRONTEND_PID"
sleep 1

echo "✅ Frontend running on http://localhost:8080"

# Summary
echo ""
echo "========================================"
echo "  OmniDrive is running!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3002"
echo "Health:   http://localhost:3002/health"
echo "API:      http://localhost:3002/api/listings"
echo ""
echo "Backend PID: $SERVER_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers:"
echo "  kill $SERVER_PID $FRONTEND_PID"
echo ""
echo "To view backend logs:"
echo "  tail -f /tmp/omni_backend.log"
echo ""
