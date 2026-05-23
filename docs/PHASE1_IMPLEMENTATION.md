# OmniDrive Phase 1: Implementation Guide

## 🎯 Overview

This guide walks you through implementing Phase 1 improvements to OmniDrive backend:
- ✅ Structured Logging (Winston)
- ✅ Input Validation (Zod)
- ✅ Comprehensive Testing (Jest)
- ✅ API Documentation (Swagger)
- ✅ Database Optimization (Indexes)
- ✅ Error Tracking (Sentry)
- ✅ CI/CD Pipeline (GitHub Actions)

## 📦 Step 1: Install New Dependencies

```bash
npm install
```

This installs all packages defined in the updated `package.json`, including:
- `winston` - Structured logging
- `zod` - Input validation
- `jest` - Testing framework
- `swagger-ui-express` - API documentation UI
- `ioredis` - Redis caching (for Phase 2)
- `sentry-node` - Error tracking

## 🔧 Step 2: Environment Configuration

Copy and update `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Required environment variables:**
```env
NODE_ENV=development
PORT=3000
ADMIN_KEY=your-secure-key-change-in-production
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
LOG_LEVEL=info
```

**Optional (for advanced features):**
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REDIS_URL=redis://localhost:6379
VAPID_PUBLIC_KEY=your_key
VAPID_PRIVATE_KEY=your_key
```

## 🚀 Step 3: Migrate to Improved Server

### Option A: Replace Current Server (Recommended)
```bash
# Backup original
cp server.js server-backup.js

# Replace with improved version
cp server-improved.js server.js
```

### Option B: Run Alongside (Testing)
Keep both servers running for A/B testing:
```bash
# Terminal 1: Original
npm start

# Terminal 2: Improved
npm run server-improved
```

## 📝 Step 4: Understanding New Folder Structure

```
config/                          # Configuration modules
  ├── logger.js                 # Winston logging setup
  ├── validation.js             # Zod schemas
  ├── swagger.js                # Swagger/OpenAPI docs
  ├── database.js               # DB optimization & stats
  └── sentry.js                 # Error tracking

middleware/                      # Express middleware
  ├── validation.js             # Zod validation middleware
  ├── errorHandler.js           # Global error handling
  ├── requestLogger.js          # HTTP request logging
  └── responseNormalizer.js     # Response format standardization

__tests__/                       # Test files
  └── api.test.js              # API endpoint tests

logs/                            # Log files (auto-created)
  ├── error.log                # Error logs
  └── combined.log             # All logs
```

## 🧪 Step 5: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Expected output:**
```
PASS  __tests__/api.test.js
  OmniDrive API Tests
    ✓ Health Check (5ms)
    ✓ Listings Endpoints (12ms)
    ✓ Orders Endpoints (8ms)
    ✓ Input Validation (4ms)
    ✓ Database Query Performance (3ms)
    ✓ Data Integrity (6ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

## 📚 Step 6: Access API Documentation

Start the improved server:
```bash
npm run server-improved
```

**Access Swagger UI:**
```
http://localhost:3000/api-docs
```

This provides:
- ✅ Interactive API exploration
- ✅ Request/response examples
- ✅ Schema definitions
- ✅ Admin authentication testing

## 📊 Step 7: Monitor Logs

Logs are automatically written to `logs/` directory with structured JSON format:

```bash
# View real-time logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Filter by action (e.g., "STK Push")
grep "STK Push" logs/combined.log
```

**Log format example:**
```json
{
  "timestamp": "2024-04-23 15:30:45",
  "level": "info",
  "message": "STK Push sent",
  "service": "omnidrive-api",
  "phone": "254712345678",
  "amount": 1500000,
  "vehicleName": "Toyota Corolla",
  "checkoutId": "WS1234567890"
}
```

## 🔒 Step 8: Set Up Error Tracking (Sentry)

### Create Sentry Project
1. Sign up at https://sentry.io
2. Create a new project: Node.js
3. Copy your DSN

### Configure in .env
```env
SENTRY_DSN=https://xxx@sentry.io/project-id
```

Now all errors are automatically tracked and reported to Sentry dashboard.

## ✅ Step 9: Validation Examples

The improved server validates all inputs automatically:

### Valid Request
```bash
curl -X POST http://localhost:3000/api/mpesa/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 1500000,
    "vehicleName": "Toyota Corolla",
    "email": "user@example.com"
  }'
```

### Invalid Phone (Will Be Rejected)
```bash
curl -X POST http://localhost:3000/api/mpesa/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "invalid-phone",
    "amount": 1500000,
    "vehicleName": "Toyota Corolla"
  }'

# Response:
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "phone",
      "message": "Invalid Kenyan phone number"
    }
  ]
}
```

## 🔄 Step 10: Database Optimization

The improved server automatically:
1. ✅ Creates indexes on frequently queried columns
2. ✅ Enables WAL (Write-Ahead Logging) for better concurrency
3. ✅ Sets cache size to 64MB for better performance
4. ✅ Enables foreign key constraints

**View database stats (Admin endpoint):**
```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "x-admin-key: your-admin-key"

# Response:
{
  "success": true,
  "data": {
    "listings": 148,
    "orders": 1234,
    "dealers": 45,
    "pendingListings": 12,
    "totalRevenue": 85500000,
    "paidOrders": 234
  }
}
```

## 🚀 Step 11: Set Up GitHub Actions

GitHub Actions are configured in `.github/workflows/ci-cd.yml`

### Required Secrets in GitHub

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add these secrets:

```
RAILWAY_TOKEN=your_railway_token
SLACK_WEBHOOK_URL=your_slack_webhook_url (optional)
```

### Workflow Triggers

```
✓ Automatically runs on every push to main/develop
✓ Runs on all pull requests
✓ Tests with Node 18.x and 20.x
✓ Builds Docker image for production
✓ Deploys to Railway on successful build
```

## 📋 Checklist: Phase 1 Implementation

- [ ] Install dependencies: `npm install`
- [ ] Configure .env file
- [ ] Run tests: `npm test`
- [ ] Start improved server: `npm run server-improved`
- [ ] Access API docs: `http://localhost:3000/api-docs`
- [ ] Test API endpoints
- [ ] Configure Sentry (optional)
- [ ] Push to GitHub to trigger CI/CD
- [ ] Monitor logs in `logs/` directory
- [ ] Update deployment scripts to use `npm run server-improved`

## 🔧 Troubleshooting

### Tests Failing
```bash
# Clear Jest cache and retry
npm test -- --clearCache
npm test
```

### Database Locked
```bash
# Delete old database and recreate
rm omnidrive.db
npm run server-improved
```

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3001 npm run server-improved
```

### Swagger UI Not Loading
```bash
# Ensure server is running and try:
# http://localhost:3000/api-docs
# Check browser console for errors
```

## 📈 Next Steps: Phase 2

After Phase 1 is stable, implement:
- [ ] Redis caching layer
- [ ] PostgreSQL migration
- [ ] Automated database backups
- [ ] Advanced rate limiting
- [ ] Session management

## 📞 Support

For issues:
1. Check logs: `logs/error.log`
2. Review Sentry dashboard
3. Check GitHub Actions logs
4. Run tests with verbose output: `npm test -- --verbose`

---

**Phase 1 Status**: Production-ready with comprehensive monitoring and testing
