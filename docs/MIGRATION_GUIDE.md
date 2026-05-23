# OmniDrive: Migration Guide - Old Server to Improved Server

## 🔄 Migration Overview

This guide helps you transition from the original `server.js` to the improved `server-improved.js` with minimal disruption.

## ⚙️ Pre-Migration Checklist

- [ ] Current server is backed up
- [ ] Database is backed up
- [ ] All tests pass on current server
- [ ] .env file is properly configured
- [ ] Team is aware of migration window
- [ ] Rollback plan is in place

## 📋 What's Different

### Before (Original Server)
```javascript
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

// Direct SQL queries
db.prepare('SELECT * FROM listings WHERE isActive = 1').all();

// No validation
app.post('/api/mpesa/purchase', (req, res) => {
    const { phone, amount } = req.body; // No validation!
    // ...
});

// Simple error handling
try {
    // ...
} catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
}

// Console logging
console.log('Order received');

app.listen(3000, () => {
    console.log('Server running');
});
```

### After (Improved Server)
```javascript
const logger = require('./config/logger');
const { validateBody } = require('./middleware/validation');
const { mpesaPurchaseSchema } = require('./config/validation');
const { asyncHandler } = require('./middleware/errorHandler');
const { getDatabaseStats } = require('./config/database');

// Validation + async error handling
app.post('/api/mpesa/purchase',
    mpesaLimiter,
    validateBody(mpesaPurchaseSchema),
    asyncHandler(async (req, res) => {
        const { phone, amount } = req.validated; // Guaranteed safe
        // ...
    })
);

// Structured logging
logger.info('Order received', { phone, amount });

// Global error handler
app.use(errorHandler);

// Startup with logging
logger.info('OmniDrive Backend Started', {
    port: PORT,
    environment: process.env.NODE_ENV
});
```

## 🔀 Step-by-Step Migration

### Option A: Full Replacement (Recommended for new installations)

```bash
# 1. Backup original
cp server.js server-backup.js

# 2. Replace with improved
cp server-improved.js server.js

# 3. Install dependencies
npm install

# 4. Run tests
npm test

# 5. Start server
npm run server-improved

# 6. Verify all endpoints
npm run test
```

### Option B: Gradual Migration (Recommended for production)

#### Phase 1: Run Both (1-2 weeks)
```bash
# Terminal 1: Keep original running
npm start

# Terminal 2: Start improved on different port
PORT=3001 npm run server-improved

# Update frontend to call improved server on specific endpoints
```

#### Phase 2: Route Critical Traffic
```bash
# Update client to use improved server for:
# - Listings (non-critical)
# - Payment (critical - test thoroughly!)

# Keep original for:
# - Chat (non-critical yet)
# - Admin functions (still testing)
```

#### Phase 3: Complete Migration
```bash
# Once all tests pass and metrics look good:
cp server-improved.js server.js
npm run server-improved
```

### Option C: Canary Deployment (For large production)

```bash
# 1. Deploy improved server as new service
# 2. Route 10% of traffic to improved
# 3. Monitor for 24 hours
# 4. Increase to 50% after 24 hours
# 5. Switch 100% after 48 hours with no errors
```

## 🔑 Key Changes in API Calls

### Client-Side Changes

#### Payments Endpoint
```javascript
// OLD: No validation, unclear error response
fetch('/api/mpesa/purchase', {
    method: 'POST',
    body: JSON.stringify({
        phone: req.phone,  // Could be invalid format
        amount: req.amount,
        vehicleName: req.vehicleName
    })
})

// NEW: Validates phone format, clear error response
fetch('/api/mpesa/purchase', {
    method: 'POST',
    body: JSON.stringify({
        phone: req.phone,  // Must be 254712345678 or 0712345678
        amount: req.amount, // Must be 1-999999
        vehicleName: req.vehicleName,
        email: req.email  // New optional field
    })
})
.then(r => r.json())
.then(data => {
    if (!data.success) {
        console.error(data.details); // More detailed errors
    }
})
```

#### Listings Endpoint
```javascript
// OLD: Basic response
GET /api/listings?brand=Toyota
Response: [{ id, brand, model, price, ... }]

// NEW: Structured response with pagination
GET /api/listings?brand=Toyota&page=1&limit=20
Response: {
    success: true,
    data: [{ id, brand, model, price, ... }],
    pagination: { page: 1, limit: 20, total: 148, pages: 8 },
    error: null,
    timestamp: "2024-04-23T15:30:45.123Z"
}
```

#### Admin Endpoints
```javascript
// UNCHANGED: Admin key still required
GET /api/admin/stats
Headers: { 'x-admin-key': 'your-admin-key' }

// RESPONSE CHANGED: Now normalized
Response: {
    success: true,
    data: {
        listings: 148,
        orders: 1234,
        ...
    },
    error: null,
    timestamp: "2024-04-23T15:30:45.123Z"
}
```

## 🛠️ Code Updates Needed in Frontend

### Update Response Handling
```javascript
// OLD: Direct access to data
const listings = await fetch('/api/listings').then(r => r.json());
listings.forEach(item => {...});

// NEW: Access via .data property
const response = await fetch('/api/listings').then(r => r.json());
if (response.success) {
    response.data.forEach(item => {...});
} else {
    console.error(response.error);
}
```

### Update Error Handling
```javascript
// OLD: Inconsistent error format
.catch(err => console.error(err));

// NEW: Consistent error format
.then(r => r.json())
.then(data => {
    if (!data.success) {
        if (data.details) {
            // Validation error with details
            data.details.forEach(d => console.error(d.field, d.message));
        } else {
            // Generic error
            console.error(data.error);
        }
    }
})
.catch(err => console.error('Network error:', err));
```

### Update Form Validation
```javascript
// OLD: Manual validation
if (!phone || phone.length < 10) {
    alert('Invalid phone');
}

// NEW: Server validates, but frontend can pre-validate
const validPhone = /^(?:\+?254|0)[17]\d{8}$/.test(phone);
if (!validPhone) {
    alert('Invalid Kenyan phone number');
}
```

## 📊 Testing Your Migration

### Automated Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Listings"

# Check coverage
npm run test:coverage
```

### Manual Testing

#### Test Listing Retrieval
```bash
curl -X GET 'http://localhost:3000/api/listings?brand=Toyota&limit=10' \
  -H 'Content-Type: application/json'

# Expected: Paginated response with data array
```

#### Test Validation
```bash
curl -X POST 'http://localhost:3000/api/mpesa/purchase' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"invalid", "amount":1000}'

# Expected: 400 error with validation details
```

#### Test Admin Functions
```bash
curl -X GET 'http://localhost:3000/api/admin/stats' \
  -H 'x-admin-key: your-admin-key'

# Expected: Statistics object with success: true
```

### Performance Testing
```bash
# Compare response times
curl -w "Total time: %{time_total}s\n" \
  'http://localhost:3000/api/listings?limit=100'

# Should be <500ms for most queries
```

## 🔍 Rollback Plan

If issues occur, rollback is simple:

```bash
# 1. Stop improved server
# Ctrl+C

# 2. Restore original
cp server-backup.js server.js

# 3. Restart with original
npm start

# 4. Analyze issue
grep "error" logs/error.log

# 5. Fix and retry migration
```

## 📈 Monitoring Post-Migration

### Check Logs
```bash
# Monitor errors in real-time
tail -f logs/error.log

# Check for validation errors
grep "Validation error" logs/combined.log

# Monitor response times
grep "duration" logs/combined.log | tail -50

# Check rate limiting hits
grep "Too many requests" logs/combined.log
```

### Monitor Metrics
```bash
# Get stats via API
curl -X GET 'http://localhost:3000/api/admin/stats' \
  -H 'x-admin-key: your-key'

# Compare with previous stats
# - Order count should increase
# - Error rate should stay <1%
# - Response times should improve
```

### Setup Alerts
```bash
# Check for error spikes (optional: Sentry dashboard)
# Check for slow queries: grep "duration.*[5-9][0-9][0-9]ms\|[0-9][0-9][0-9][0-9]ms" logs/combined.log
# Check for rate limiting: grep "Too many requests" logs/combined.log
```

## 🎯 Success Criteria

After migration, verify:

✅ **Functionality**
- [ ] All endpoints respond with same data
- [ ] Payments process successfully
- [ ] Listings display correctly
- [ ] Admin functions work

✅ **Performance**
- [ ] Average response time < 500ms
- [ ] Database queries < 100ms
- [ ] No significant increase in errors

✅ **Quality**
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No new errors in logs
- [ ] No rate limiting issues

✅ **Documentation**
- [ ] Swagger docs accessible
- [ ] Logs properly structured
- [ ] Error tracking working

## 📝 Migration Checklist

### Pre-Migration
- [ ] Read PHASE1_IMPLEMENTATION.md
- [ ] Backup database
- [ ] Backup original server
- [ ] Configure .env file
- [ ] Install dependencies

### During Migration
- [ ] Run tests: `npm test`
- [ ] Start server: `npm run server-improved`
- [ ] Test endpoints manually
- [ ] Check API docs: /api-docs
- [ ] Monitor logs: `tail -f logs/combined.log`

### Post-Migration
- [ ] All tests passing
- [ ] No error spikes
- [ ] Performance metrics good
- [ ] Sentry configured (optional)
- [ ] Document any issues
- [ ] Update deployment scripts
- [ ] Team training on new features

## 🆘 Troubleshooting

### Issue: Tests Failing
```bash
# Solution: Clear cache and retry
npm test -- --clearCache
npm test
```

### Issue: Database Issues
```bash
# Solution: Restart with fresh database
rm omnidrive.db
npm run server-improved
```

### Issue: Port in Use
```bash
# Solution: Use different port
PORT=3001 npm run server-improved
```

### Issue: Module Not Found
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues during migration:
1. Check PHASE1_IMPLEMENTATION.md
2. Review SECURITY_HARDENING.md
3. Check API docs at /api-docs
4. Look in logs/error.log
5. Run npm test for diagnostics

---

**Migration Time**: 1-4 hours depending on testing thoroughness

**Recommendation**: Use Option B (Gradual Migration) for production systems to minimize risk.
