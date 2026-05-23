# 🚀 Phase 2 Quick Start Guide

## Get Started in 5 Minutes

### **1. Install Dependencies**
```bash
cd /home/james-nzuki/development/PERSONAL-PROJECTS/WORKING-ON/OmniDrive
npm install
```

### **2. Start Redis (Required)**

**Option A: Docker (Easiest)**
```bash
docker run -d -p 6379:6379 --name omnidrive-redis redis:latest
```

**Option B: Direct Installation**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
redis-server

# macOS
brew install redis
redis-server

# Or from https://redis.io/download
```

### **3. Configure Environment Variables**

Create/update `.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_PATH=omnidrive.db

# Redis (Phase 2)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for queue jobs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@omnidrive.co.ke

# MPesa (existing)
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
# ... other existing configs
```

### **4. Start the Server**

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

**Expected Output:**
```
✅ OmniDrive backend running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
🔌 WebSocket: ✅ Enabled
⏳ Background Jobs: ✅ Enabled
📦 Inventory Sync: ✅ Enabled
```

---

## ✅ Verify Installation

### **Test WebSocket Connection**

```bash
# Open another terminal
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "env": "development",
  "uptime": 12.345,
  "timestamp": "2026-05-02T..."
}
```

### **Test Queue System**

```bash
curl http://localhost:3000/api/inventory-sync/queue-stats
```

Should return queue statistics with all 5 queues.

### **Check API Documentation**

Open browser: `http://localhost:3000/api-docs`

---

## 🧪 Testing Phase 2 Features

### **Test 1: Real-Time WebSocket**

**File: `test-websocket.js`**
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  query: { userId: 'test-user-1', userType: 'client' }
});

socket.on('connected', (data) => {
  console.log('✅ WebSocket connected:', data);
  
  // Subscribe to price alerts for a vehicle
  socket.emit('subscribe-price-alert', 'vehicle-123');
  console.log('📢 Subscribed to price alerts');
});

socket.on('price-dropped', (data) => {
  console.log('💰 Price drop alert:', data);
});

socket.on('disconnect', () => {
  console.log('❌ WebSocket disconnected');
});
```

Run:
```bash
node test-websocket.js
```

### **Test 2: Background Job Queue**

**File: `test-queue.js`**
```javascript
const QueueManager = require('./config/queue');

async function testQueue() {
  const queueManager = new QueueManager();
  
  try {
    // Queue an email
    const emailJob = await queueManager.queueEmail(
      'test@example.com',
      'Welcome to OmniDrive!',
      '<h1>Welcome!</h1><p>Thanks for joining</p>'
    );
    console.log('📧 Email job queued:', emailJob.id);
    
    // Queue a notification
    const notifJob = await queueManager.queueNotification(
      'test-user-1',
      'price-alert',
      {
        vehicleId: 'vehicle-123',
        price: 500000,
        savings: 50000
      },
      ['in-app', 'email']
    );
    console.log('🔔 Notification job queued:', notifJob.id);
    
    // Get queue stats
    const stats = await queueManager.getQueueStats();
    console.log('📊 Queue stats:', stats);
    
    await queueManager.shutdown();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQueue();
```

Run:
```bash
node test-queue.js
```

### **Test 3: Inventory Sync**

**File: `test-inventory-sync.js`**
```bash
# Register a source
curl -X POST http://localhost:3000/api/inventory-sync/sources \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "test-source",
    "name": "Test Inventory",
    "endpoint": "https://jsonplaceholder.typicode.com/todos",
    "apiKey": "test-key"
  }'

# Get all sources
curl http://localhost:3000/api/inventory-sync/sources

# Get statistics
curl http://localhost:3000/api/inventory-sync/stats

# Get queue stats
curl http://localhost:3000/api/inventory-sync/queue-stats
```

---

## 📊 Monitoring Dashboard

### **Real-Time Monitoring**

```bash
# Watch queue stats in real-time
watch -n 2 'curl -s http://localhost:3000/api/inventory-sync/queue-stats | jq .'

# Watch system health
watch -n 1 'curl -s http://localhost:3000/health | jq .'
```

### **Check Server Logs**

```bash
# View logs (with npm run dev)
# Look for messages like:
# ✅ WebSocket manager initialized
# ✅ Queue system initialized
# 📦 Inventory sync service initialized
```

---

## 🚨 Troubleshooting

### **Issue: "Redis connection failed"**

**Solution:**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not, start Redis:
redis-server
```

### **Issue: "Queue manager initialization failed"**

**Solution:**
```bash
# Ensure Redis is accessible
redis-cli -h localhost -p 6379
# Should connect

# Check .env variables
cat .env | grep REDIS
```

### **Issue: "WebSocket connection refused"**

**Solution:**
```bash
# Check if server is running on correct port
lsof -i :3000
# Should show Node.js process

# Restart server
npm run dev
```

### **Issue: "Port 3000 already in use"**

**Solution:**
```bash
# Kill existing process
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## 📈 Performance Testing

### **Load Test WebSocket**

```javascript
// test-load.js
const io = require('socket.io-client');

const numConnections = 100;
const connections = [];

for (let i = 0; i < numConnections; i++) {
  const socket = io('http://localhost:3000', {
    query: { userId: `load-test-${i}`, userType: 'client' }
  });
  
  socket.on('connected', () => {
    console.log(`✅ Connection ${i} established`);
  });
  
  connections.push(socket);
}

console.log(`🔄 Created ${numConnections} WebSocket connections`);

setTimeout(() => {
  connections.forEach(s => s.disconnect());
  console.log('✅ All connections closed');
}, 30000);
```

Run:
```bash
node test-load.js
```

---

## 🎯 Next Steps

After Phase 2 is working:

1. **Deploy to Railway/Vercel**
   - Update `.env.production`
   - Add Redis add-on
   - Deploy backend

2. **Integrate with Frontend**
   - Update `index.js` to use WebSocket
   - Add real-time price alerts UI
   - Add order status notifications

3. **Start Phase 3**
   - Build user dashboards
   - Implement real-time features
   - Add analytics

---

## 📚 Documentation

- Full Phase 2 docs: `PHASE2_COMPLETE.md`
- API docs: `http://localhost:3000/api-docs`
- Code comments in all new files

---

## ✨ What You Can Do Now

✅ Stream real-time inventory updates to clients  
✅ Send price drop notifications instantly  
✅ Queue background jobs without blocking requests  
✅ Sync inventory from multiple external sources  
✅ Scale to thousands of concurrent users  
✅ Monitor job processing in real-time  

---

**Ready? Start with:** `npm run dev`
