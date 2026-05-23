# OmniDrive Security Hardening Guide - Phase 1

## 🔐 Security Improvements Implemented

### 1. Input Validation (Zod)
All API inputs are validated against strict schemas:

```javascript
// ✅ BEFORE: No validation
app.post('/api/mpesa/purchase', (req, res) => {
    const { phone, amount } = req.body;
    // Could accept anything!
});

// ✅ AFTER: Zod validation
app.post('/api/mpesa/purchase', 
    validateBody(mpesaPurchaseSchema),
    asyncHandler((req, res) => {
        const { phone, amount } = req.validated; // Guaranteed safe
    })
);
```

**Validation Rules:**
- Phone numbers: Must match `^(?:\+?254|0)[17]\d{8}$` (Kenyan format)
- Amounts: Must be 1-999,999
- Emails: Must be valid email format
- Enums: Only allowed values accepted (e.g., 'approved', 'rejected')

### 2. Structured Error Handling
- Global error handler prevents sensitive information leakage
- Production mode hides stack traces
- All errors logged securely

```javascript
// ✅ Production error response (no stack trace)
{
  "success": false,
  "error": "An error occurred processing your request",
  "timestamp": "2024-04-23T15:30:45.123Z"
}

// ✅ Development error response (with details)
{
  "success": false,
  "error": "ENOENT: no such file or directory",
  "stack": "Error: ENOENT...",
  "timestamp": "2024-04-23T15:30:45.123Z"
}
```

### 3. Database Security
- **Foreign Key Constraints**: Enforced on all relationships
- **Parameterized Queries**: All SQL uses bound parameters (SQLite3 handles this)
- **Database Indexes**: Added on all frequently queried columns

```javascript
// ✅ SAFE: Uses parameterized query
db.prepare('SELECT * FROM listings WHERE brand = ? AND price > ?')
    .all(userInput, priceLimit);

// ❌ DANGEROUS: String interpolation (would be vulnerable to injection)
// db.prepare(`SELECT * FROM listings WHERE brand = '${userInput}'`)
```

### 4. Request Logging
All requests logged with:
- ✅ Method, path, status code
- ✅ Response time
- ✅ User IP address
- ✅ Admin actions tracked separately

```json
{
  "timestamp": "2024-04-23 15:30:45",
  "level": "info",
  "message": "POST /api/mpesa/purchase",
  "method": "POST",
  "path": "/api/mpesa/purchase",
  "statusCode": 200,
  "duration": "245ms",
  "ip": "192.168.1.100"
}
```

### 5. Rate Limiting
Protected endpoints have strict rate limits:

```javascript
const mpesaLimiter = rateLimit({
    windowMs: 60000,      // 1 minute window
    max: 5,               // 5 requests per minute per IP
    message: { 
        error: 'Too many requests, please try again later.' 
    }
});

const apiLimiter = rateLimit({
    windowMs: 60000,
    max: 60,              // 60 requests per minute for general API
});
```

**Protected Endpoints:**
- `POST /api/mpesa/purchase` - 5 req/min per IP
- `POST /api/dealer/register` - 60 req/min per IP
- `POST /api/listings/submit` - 60 req/min per IP
- `POST /api/chat/*` - 60 req/min per IP

### 6. Admin Authentication
All admin endpoints require X-Admin-Key header:

```bash
# ✅ CORRECT: Include admin key
curl -X GET http://localhost:3000/api/admin/stats \
  -H "x-admin-key: your-secure-admin-key"

# ❌ WRONG: No key or wrong key
curl -X GET http://localhost:3000/api/admin/stats
# Response: 401 Unauthorized
```

**Security Recommendations:**
1. Use a long, cryptographically random key (32+ characters)
2. Store ADMIN_KEY only in `.env` (never in code)
3. Rotate admin key every 3 months in production
4. Different key for each environment (dev, staging, production)

### 7. Error Tracking (Sentry)
All errors automatically reported to Sentry:

```javascript
// Automatically captured by middleware
app.use(Sentry.Handlers.errorHandler());

// Manual error capture
captureException(error, { context: 'payment-processing' });
captureMessage('Payment alert', 'warning', { orderId: '123' });
```

**Sentry Benefits:**
- ✅ Real-time error notifications
- ✅ Error grouping and trending
- ✅ Performance monitoring
- ✅ Release tracking

### 8. Response Normalization
All API responses follow standard format:

```javascript
// All responses normalized to:
{
    "success": true|false,
    "data": {...},           // Actual data
    "error": null|string,    // Error message if any
    "timestamp": "ISO-8601"
}
```

This prevents accidental information leakage from inconsistent response formats.

## 🛡️ Security Best Practices

### 1. Environment Variables
✅ DO:
```env
# .env (never committed to git)
ADMIN_KEY=kj8#$@!mP9xL2qR&vWt4nD6s5H3G1F0b
SMTP_PASS=app-specific-password
MPESA_CONSUMER_SECRET=secret-key-from-safaricom
```

❌ DON'T:
```javascript
// ❌ NEVER hardcode secrets
const ADMIN_KEY = 'my-admin-key';
const API_SECRET = 'secret123';
```

### 2. CORS Configuration
✅ Configured in .env:
```env
CORS_ORIGIN=http://localhost:3000,https://omnidrive.co.ke
```

❌ Open CORS invites attacks:
```javascript
// ❌ DANGEROUS
app.use(cors()); // Allows all origins!
```

### 3. Helmet Security Headers
✅ Enabled in improved server:
```javascript
app.use(helmet({
    contentSecurityPolicy: false // Disabled only if needed for specific use case
}));
```

This adds headers like:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### 4. Password/Secret Handling
✅ Secure:
```bash
# Use environment variables
MPESA_PASSKEY=safaricom-passkey

# Use one-time passwords for M-Pesa STK
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
```

❌ Insecure:
```javascript
// ❌ Reusing same password
const password = Buffer.from(`${shortcode}${passkey}`).toString('base64');
```

## 📋 Security Checklist

- [ ] All environment variables in `.env` (not in code)
- [ ] `.env` added to `.gitignore`
- [ ] ADMIN_KEY changed from default
- [ ] CORS_ORIGIN configured for your domain
- [ ] SMTP credentials are app-specific passwords
- [ ] Sentry DSN configured for error tracking
- [ ] All tests passing
- [ ] No console.log() for sensitive data
- [ ] Database indexes created for performance
- [ ] Rate limiting active on all public endpoints
- [ ] Helmet security headers enabled
- [ ] Input validation active on all routes

## 🔄 Database Migration (Future)

After Phase 1 stabilizes, migrate from SQLite to PostgreSQL:

```bash
# Install PostgreSQL tools
brew install postgresql  # macOS
apt-get install postgresql  # Linux

# Create database
createdb omnidrive_prod

# Update connection string
DATABASE_URL=postgresql://user:password@localhost:5432/omnidrive_prod
```

Benefits:
- ✅ Better concurrency (multiple writers)
- ✅ ACID compliance
- ✅ Built-in replication and backups
- ✅ Row-level security policies
- ✅ Full-text search capabilities

## 🚨 Emergency Procedures

### If Admin Key Compromised
```bash
# 1. Generate new key
openssl rand -base64 32

# 2. Update .env
ADMIN_KEY=new-generated-key

# 3. Restart server
npm run server-improved

# 4. Review audit logs
grep "admin" logs/combined.log | tail -100
```

### If Database Corrupted
```bash
# 1. Backup current database
cp omnidrive.db omnidrive.db.backup

# 2. Delete corrupted database
rm omnidrive.db

# 3. Restart server (recreates with indexes)
npm run server-improved

# 4. Restore data from backups if available
```

### If Under DDoS Attack
```javascript
// Temporarily reduce rate limits further
const emergencyLimiter = rateLimit({
    windowMs: 60000,
    max: 5,  // Very strict
    skipSuccessfulRequests: false
});

app.use(emergencyLimiter);
```

## 🔗 Security Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Checklist: https://nodejs.org/en/docs/guides/security/
- Express Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- Sentry Documentation: https://docs.sentry.io/

## 📊 Security Monitoring

Monitor these metrics:
1. **Failed validations**: Check logs for pattern of invalid inputs
2. **Rate limit hits**: Indicates possible attack attempts
3. **Error spikes**: Unusual number of errors
4. **Admin actions**: Audit who/when changes made
5. **Slow queries**: Performance degradation indicates issues

```bash
# Check for validation errors
grep "Validation error" logs/combined.log | wc -l

# Check for rate limit hits
grep "Too many requests" logs/combined.log

# Check for errors
grep "error" logs/error.log | tail -50
```

---

**Security Status**: Production-hardened with validation, logging, and error tracking
