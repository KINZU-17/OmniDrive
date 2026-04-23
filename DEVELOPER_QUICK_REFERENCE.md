# OmniDrive Developer Quick Reference

## 🚀 Quick Start (60 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Run tests
npm test

# 4. Start server
npm run server-improved

# 5. View API docs
open http://localhost:3000/api-docs
```

## 📋 Common Commands

```bash
# Start improved server
npm run server-improved

# Run in watch mode (auto-reload)
nodemon server-improved.js

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# View logs in real-time
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Filter logs by text
grep "STK Push" logs/combined.log

# Count specific events
grep "Validation error" logs/combined.log | wc -l
```

## 🔐 Environment Variables

### Required
```env
NODE_ENV=development
PORT=3000
ADMIN_KEY=your-secure-key
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
SMTP_USER=email@example.com
SMTP_PASS=app-password
```

### Optional
```env
SENTRY_DSN=https://xxx@sentry.io/id
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

## 🧪 Testing Patterns

### Run Specific Tests
```bash
# Run tests matching "Listings"
npm test -- --testNamePattern="Listings"

# Run single test file
npm test -- __tests__/api.test.js

# Run with verbose output
npm test -- --verbose

# Run and update snapshots
npm test -- -u
```

## 🔗 API Endpoints Quick Reference

### Listings
```bash
# Get all listings
GET /api/listings?brand=Toyota&category=Car&page=1&limit=20

# Get single listing
GET /api/listings/1

# Create listing (admin)
POST /api/listings -H "x-admin-key: KEY" -d {...}

# Update listing (admin)
PUT /api/listings/1 -H "x-admin-key: KEY" -d {...}

# Delete listing (admin)
DELETE /api/listings/1 -H "x-admin-key: KEY"
```

### Payment
```bash
# Initiate payment
POST /api/mpesa/purchase -d '{"phone":"254...", "amount":1500000, ...}'

# Check payment status
GET /api/mpesa/status/CHECKOUT_ID

# Handle payment callback
POST /api/mpesa/callback (from M-Pesa)
```

### Admin
```bash
# Get dashboard stats
GET /api/admin/stats -H "x-admin-key: KEY"

# Get all orders
GET /api/admin/orders -H "x-admin-key: KEY"

# Get order details
GET /api/admin/orders/123 -H "x-admin-key: KEY"

# Get dealers
GET /api/admin/dealers -H "x-admin-key: KEY"

# Approve dealer
PATCH /api/admin/dealers/123 -H "x-admin-key: KEY" -d '{"status":"approved"}'
```

## 📝 Adding New Validation Schema

### Step 1: Define Schema
```javascript
// config/validation.js
const newSchema = z.object({
    field1: z.string().min(1),
    field2: z.number().positive(),
    field3: z.enum(['option1', 'option2'])
});
```

### Step 2: Export Schema
```javascript
module.exports = {
    // ... existing schemas
    newSchema,
};
```

### Step 3: Use in Route
```javascript
// server.js
app.post('/api/endpoint',
    validateBody(newSchema),
    asyncHandler((req, res) => {
        const { field1, field2 } = req.validated;
        // ...
    })
);
```

## 🐛 Debugging

### Check Database
```bash
# Connect to SQLite database
sqlite3 omnidrive.db

# Inside sqlite3:
.mode json
SELECT * FROM listings LIMIT 1;
SELECT COUNT(*) FROM orders WHERE status='paid';
.exit
```

### View Request Details
```bash
# Monitor all requests
grep "POST\|GET\|PUT\|DELETE" logs/combined.log | tail -50

# Monitor specific endpoint
grep "/api/mpesa" logs/combined.log | tail -20

# Check response times
grep "duration" logs/combined.log | tail -10
```

### Troubleshoot Errors
```bash
# Find error details
grep "error" logs/error.log | head -20

# Search by error type
grep "Validation error" logs/combined.log

# Check stack traces
grep -A 5 "stack" logs/error.log
```

## 🔄 Database Operations

### View Statistics
```javascript
// Use API endpoint
GET /api/admin/stats -H "x-admin-key: KEY"

// Response
{
  "listings": 148,
  "orders": 1234,
  "dealers": 45,
  "pendingListings": 12,
  "totalRevenue": 85500000,
  "paidOrders": 234
}
```

### Backup Database
```bash
# Backup current database
cp omnidrive.db omnidrive.db.$(date +%Y%m%d-%H%M%S).backup

# List all backups
ls -lah omnidrive.db*.backup
```

### Reset Database (Development Only)
```bash
# Delete database (will be recreated with indexes)
rm omnidrive.db

# Restart server
npm run server-improved

# Server will recreate with all tables and indexes
```

## 📊 Logging Best Practices

### Log Levels
```javascript
logger.error()   // Critical errors
logger.warn()    // Warnings and issues
logger.info()    // Important events
logger.debug()   // Debugging information
```

### Good Logging
```javascript
// ✅ DO: Log context
logger.info('Payment confirmed', {
    receipt,
    checkoutId,
    amount,
    phone
});

// ❌ DON'T: Log sensitive data
logger.info(`Payment: ${JSON.stringify(stkData)}`); // Could leak secrets
```

## 🛡️ Security Reminders

### Admin Key
```bash
# ✅ Use strong, random key
ADMIN_KEY=kj8#$@!mP9xL2qR&vWt4nD6s5H3G1F0b

# ❌ DON'T use weak keys
ADMIN_KEY=admin123  # Too simple!
```

### Validation
```bash
# ✅ All inputs validated automatically
# ❌ Never skip validation with validateBody()
```

### Secrets
```bash
# ✅ Store in .env
MPESA_CONSUMER_SECRET=actual_secret

# ❌ Never in code
const SECRET = 'my-secret'; // ❌ WRONG
```

## 🆘 Common Issues

### Port Already in Use
```bash
# Change port
PORT=3001 npm run server-improved

# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

### Database Locked
```bash
# Solution: Just restart
npm run server-improved

# If persistent, delete and recreate
rm omnidrive.db
npm run server-improved
```

### Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Check for database issues
npm test -- --runInBand
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🔗 Useful Links

- **API Docs**: http://localhost:3000/api-docs
- **GitHub Repo**: https://github.com/your-org/OmniDrive
- **Sentry Dashboard**: https://sentry.io/your-project
- **Railway Deploy**: https://railway.app

## 📞 Getting Help

1. **Check logs**: `tail -f logs/combined.log`
2. **Run tests**: `npm test`
3. **Read guides**: `PHASE1_IMPLEMENTATION.md`, `SECURITY_HARDENING.md`
4. **API docs**: `http://localhost:3000/api-docs`
5. **Sentry errors**: `https://sentry.io/your-project`

## 🎯 Development Workflow

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Install dependencies
npm install

# 3. Write tests first
npm test -- --watch

# 4. Implement feature
# (server auto-reloads with nodemon)

# 5. Run full test suite
npm test

# 6. Check code coverage
npm run test:coverage

# 7. Commit and push
git add .
git commit -m "feat: add new feature"
git push

# 8. GitHub Actions runs automatically
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] No console.log statements
- [ ] .env configured correctly
- [ ] Database backups taken
- [ ] Logs reviewed for errors
- [ ] Admin key rotated (if needed)
- [ ] Sentry configured
- [ ] Ready to deploy

---

**Keep this handy for quick reference while developing!**
