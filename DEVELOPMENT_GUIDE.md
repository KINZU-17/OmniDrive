# DEVELOPMENT_GUIDE.md

## Complete Development Guide - OmniDrive Phase 1

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your values

# 3. Run in development mode
npm run dev-improved

# 4. Run tests
npm test

# 5. View API documentation
# Open http://localhost:3000/api-docs
```

---

## Project Structure

```
OmniDrive/
├── config/
│   ├── logger.js          # Winston logging configuration
│   ├── swagger.js         # Swagger/OpenAPI setup
│   ├── sentry.js          # Error tracking setup
│   ├── database.js        # Database optimization
│   └── validation.js      # Zod schemas
│
├── middleware/
│   ├── validation.js      # Request/query validation
│   ├── errorHandler.js    # Centralized error handling
│   ├── requestLogger.js   # Request/response logging
│   └── responseNormalizer.js # Response format normalization
│
├── schemas/
│   └── validation.js      # Reusable Zod validation schemas
│
├── __tests__/
│   ├── api.test.js        # API endpoint tests
│   ├── middleware.test.js # Middleware unit tests
│   └── database.test.js   # Database tests
│
├── .github/workflows/
│   ├── ci-cd.yml          # Main CI/CD pipeline
│   └── scheduled-tasks.yml # Automated maintenance
│
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── logs/                  # Application logs (auto-created)
```

---

## Key Scripts

```bash
# Development
npm run dev-improved        # Run with nodemon
npm test                    # Run all tests
npm run test:watch         # Tests in watch mode
npm run test:coverage      # Generate coverage report

# Production
npm start                   # Run production server
npm run deploy             # Deploy to Railway

# Other
npm audit                  # Check for vulnerabilities
npm audit fix              # Auto-fix vulnerabilities
```

---

## Creating API Endpoints

### Example: Adding a New Endpoint

```javascript
// server.js
const { validateRequest } = require('./middleware/validation');
const { MpesaPaymentSchema } = require('./schemas/validation');
const { asyncHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Swagger documentation
/**
 * @swagger
 * /api/custom/endpoint:
 *   post:
 *     summary: Custom endpoint
 *     tags: [Custom]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: $ref: '#/components/schemas/YourSchema'
 *     responses:
 *       200:
 *         description: Success
 */
app.post('/api/custom/endpoint',
    validateRequest(YourSchema),  // Automatic validation
    asyncHandler(async (req, res) => {
        logger.info('Processing custom endpoint', {
            userId: req.body.userId,
        });
        
        // Your logic here
        const result = await processData(req.body);
        
        logger.info('Custom endpoint processed', { result });
        res.json(result);  // Auto-normalized response
    })
);
```

### Key Points:
1. **Always use `validateRequest(schema)`** for body validation
2. **Always use `asyncHandler`** to wrap async functions
3. **Use `logger.info/error/warn`** for logging
4. **Response is auto-normalized** - just pass the data
5. **Add Swagger documentation** for API docs

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test __tests__/api.test.js

# Watch mode (re-run on file change)
npm test --watch

# Coverage report
npm test -- --coverage
```

### Writing Tests

```javascript
describe('My Feature', () => {
    it('should do something', async () => {
        const res = await request(app).get('/api/endpoint');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
    });
});
```

### Test Coverage Targets
- Critical API endpoints: ✅ 100%
- Validation logic: ✅ 100%
- Error handling: ✅ 100%
- Database queries: ✅ 90%+

---

## Logging Best Practices

### Log Levels

```javascript
const logger = require('./config/logger');

// Info - Important business logic
logger.info('User login', { userId: 123 });

// Error - Something went wrong
logger.error('Payment failed', { orderId: 456 });

// Warn - Potential issues
logger.warn('Slow query', { duration: 5000 });

// Debug - Detailed debugging
logger.debug('Request params', { params: req.query });
```

### Log Files
- **logs/combined.log** - All messages
- **logs/error.log** - Errors only

### Querying Logs
```bash
# Last 100 lines
tail -100 logs/combined.log

# Search for errors
grep "error" logs/combined.log

# Real-time monitoring
tail -f logs/combined.log
```

---

## Validation

### Using Zod Schemas

```javascript
const { 
    MpesaPaymentSchema,
    VehicleListingSchema,
    OrderSchema 
} = require('./schemas/validation');

// Validate data
const result = MpesaPaymentSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        success: false,
        errors: result.error.errors,
    });
}

const validatedData = result.data;
```

### Creating Custom Schemas

```javascript
// schemas/validation.js
const MySchema = z.object({
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18+'),
    status: z.enum(['active', 'inactive']),
    tags: z.array(z.string()).default([]),
});

module.exports = { MySchema };
```

---

## Database Optimization

### Querying Efficiently

```javascript
const Database = require('better-sqlite3');
const db = new Database('omnidrive.db');

// Good: Uses index on brand
const stmt = db.prepare('SELECT * FROM listings WHERE brand = ?');
const results = stmt.all('Toyota');

// Good: Efficient filter
const stmt2 = db.prepare(`
    SELECT * FROM listings 
    WHERE price BETWEEN ? AND ? 
    AND isActive = 1
    LIMIT 20 OFFSET ?
`);
const results2 = stmt2.all(100000, 500000, 0);

// Bad: Full table scan (slow)
const stmt3 = db.prepare('SELECT * FROM listings WHERE LOWER(model) LIKE ?');
```

### Adding Indexes

```javascript
// In server.js or config/database.js
db.exec(`
    CREATE INDEX IF NOT EXISTS idx_your_column 
    ON your_table(your_column);
`);
```

---

## Error Handling

### Global Error Handler

All errors are caught automatically and normalized:

```javascript
// Error from validation
POST /api/endpoint { invalid: 'data' }
→ 400 Response with validation errors

// Error from async handler
→ 500 Response with error message

// Error from unhandled rejection
→ 500 Response + Sentry notification
```

### Custom Error Handling

```javascript
app.post('/api/endpoint', asyncHandler(async (req, res) => {
    try {
        const data = await someAsyncOperation();
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Operation failed', { error: error.message });
        throw error;  // Will be caught by asyncHandler
    }
}));
```

---

## API Documentation

### Viewing Documentation

1. Start the server: `npm run dev-improved`
2. Open: http://localhost:3000/api-docs
3. Browse all endpoints, try them out directly

### Adding Documentation

```javascript
/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
app.get('/api/vehicles/:id', asyncHandler(async (req, res) => {
    // ...
}));
```

---

## Debugging

### Visual Studio Code Debugger

Create `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}/server.js",
            "restart": true,
            "console": "integratedTerminal",
            "runtimeArgs": ["-r", "dotenv/config"]
        }
    ]
}
```

Then press F5 to debug.

### Console Logging

```javascript
// Before Phase 1 (avoid)
console.log('Processing payment'); // 🚫 Not logged to file

// After Phase 1 (recommended)
logger.info('Processing payment', { orderId }); // ✅ Logged + searchable
```

---

## Deployment

### Environment Setup

```bash
# Copy template
cp .env.example .env

# Edit for your environment
nano .env

# Key variables for production
NODE_ENV=production
SENTRY_DSN=your-sentry-dsn
DATABASE_URL=your-db-url
REDIS_URL=your-redis-url
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
npm run deploy
```

### Docker Deployment

```bash
# Build image
docker build -t omnidrive .

# Run container
docker run -p 3000:3000 \
    -e NODE_ENV=production \
    -e SENTRY_DSN=... \
    omnidrive
```

---

## Performance Monitoring

### Checking Performance

```bash
# Monitor logs in real-time
tail -f logs/combined.log | grep "duration"

# Find slow requests
grep "duration.*[0-9]{4}" logs/combined.log

# Count errors
grep "error" logs/combined.log | wc -l

# Search for specific endpoint
grep "POST /api/mpesa" logs/combined.log
```

### Performance Targets

- API response time: <100ms
- Database queries: <10ms
- List endpoints: <50ms
- Payment endpoints: <500ms (due to external API)

---

## Troubleshooting

### Issue: Tests failing

```bash
# Clear cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

### Issue: Database locked

```bash
# Close other connections
ps aux | grep node
kill <pid>

# Or delete database and recreate
rm omnidrive.db
npm start
```

### Issue: Port 3000 already in use

```bash
# Find process on port
lsof -i :3000

# Kill process
kill <pid>

# Or use different port
PORT=3001 npm run dev-improved
```

### Issue: Validation errors in production

Check logs:
```bash
tail -100 logs/error.log
```

Then fix the schema or input validation.

---

## Security Checklist

Before deploying to production:

- [ ] Set strong `ADMIN_KEY` in `.env`
- [ ] Configure `CORS_ORIGIN` properly
- [ ] Enable `SENTRY_DSN` for error tracking
- [ ] Set `NODE_ENV=production`
- [ ] Verify all secret keys are set
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Enable HTTPS in production
- [ ] Set `JWT_SECRET` if using auth
- [ ] Configure backups for database
- [ ] Test payment flow with real MPesa account

---

## Resources

- **API Docs**: http://localhost:3000/api-docs
- **Winston Logger**: https://github.com/winstonjs/winston
- **Zod Validation**: https://zod.dev/
- **Jest Testing**: https://jestjs.io/
- **Swagger/OpenAPI**: https://swagger.io/
- **GitHub Actions**: https://docs.github.com/actions/

---

**Version**: 1.0.0  
**Last Updated**: April 24, 2024  
**Status**: Complete
