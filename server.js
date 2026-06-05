/**
 * OmniDrive Backend Server
 * Kenya's Premier Online Vehicle Marketplace
 *
 * Integrated infrastructure:
 * - Winston structured logging
 * - Zod input validation
 * - Sentry error tracking
 * - Swagger API documentation
 * - Database optimization & indexing
 * - Comprehensive error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const webpush = require('web-push');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const http = require('http');

// Database (node:sqlite — schema, migrations & seed live in config/db.js)
const { db } = require('./config/db');

// Auth (JWT) — replaces the old spoofable header/admin-key scheme
const { signToken, authenticate, optionalAuth, requireRole } = require('./middleware/auth');

// SMS (provider-agnostic) — used for phone OTP login
const { sendSms } = require('./services/sms');

// Config imports
const logger = require('./config/logger');
const {
    mpesaPurchaseSchema,
    listingQuerySchema,
    listingCreateSchema,
    listingUpdateSchema,
    dealerRegisterSchema,
    pendingListingSchema,
    adminActionSchema,
} = require('./config/validation');
const swaggerSpecs = require('./config/swagger');
const { initializeIndexes, optimizeDatabase, getDatabaseStats } = require('./config/database');
const { initSentry } = require('./config/sentry');
const WebSocketManager = require('./config/websocket');
const QueueManager = require('./config/queue');
const InventorySyncService = require('./services/inventorySync');

// Middleware imports
const { validateBody, validateQuery, validateParams } = require('./middleware/validation');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const normalizeResponse = require('./middleware/responseNormalizer');

// ─── INITIALIZE EXPRESS APP ─────────────────────────────────────────────────
const app = express();

// Sentry initialization (if configured)
initSentry(app);

// ─── MIDDLEWARE STACK ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Serve the built React app. `index: 'index.html'` serves the SPA at '/';
// Express static never lists directories, so there is no directory-listing leak.
const reactBuildPath = path.join(__dirname, 'web', 'dist');
app.use(express.static(reactBuildPath, { index: 'index.html' }));
// Serve vehicle images and other public assets (no directory index).
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets'), { index: false, redirect: false }));
app.use('/public', express.static(path.join(__dirname, 'public'), { index: false, redirect: false }));

// Request logging and response normalization
app.use(requestLogger);
app.use(normalizeResponse);

// ─── API DOCUMENTATION ─────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    swaggerOptions: {
        persistAuthorization: true,
    },
}));

// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const mpesaLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: 5,
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60'),
    standardHeaders: true,
    legacyHeaders: false,
});

// Tighter limit for OTP request/verify to deter brute force and SMS abuse.
const otpLimiter = rateLimit({
    windowMs: 60000,
    max: 5,
    message: { success: false, error: 'Too many code requests, please wait a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── DATABASE INITIALIZATION ───────────────────────────────────────────────
// Connection, schema, migrations and first-run seed are all handled in
// ./config/db.js (node:sqlite). Here we just apply runtime tuning + extra indexes.
const dbPath = process.env.DB_PATH || path.join(__dirname, 'omnidrive.db');
logger.info('Database ready', { path: dbPath });

optimizeDatabase(db);
try {
    initializeIndexes(db);
    logger.info('Database initialized successfully');
} catch (error) {
    logger.error('Index initialization issue (continuing)', { error: error.message });
}

// ─── EMAIL CONFIGURATION ───────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

async function sendConfirmationEmail(order) {
    if (!order.customer_email || !process.env.SMTP_USER) return;
    try {
        await mailer.sendMail({
            from: `"OmniDrive" <${process.env.SMTP_USER}>`,
            to: order.customer_email,
            subject: `Payment Confirmed – ${order.vehicle_name}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                    <h2 style="color:#e47911">OmniDrive – Payment Confirmed!</h2>
                    <p>Thank you for your purchase. Here are your order details:</p>
                    <table style="width:100%;border-collapse:collapse">
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Vehicle</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${order.vehicle_name}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Amount Paid</strong></td><td style="padding:8px;border-bottom:1px solid #eee">KES ${order.amount}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>M-Pesa Receipt</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${order.receipt}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #eee">+${order.phone}</td></tr>
                        <tr><td style="padding:8px"><strong>Order ID</strong></td><td style="padding:8px">#${order.id}</td></tr>
                    </table>
                    <p style="margin-top:20px">Our team will contact you within 24 hours to arrange delivery.</p>
                    <p style="color:#888;font-size:0.85rem">OmniDrive.co.ke – Connecting you to the drive of your choice</p>
                </div>
            `
        });
        logger.info('Confirmation email sent', { to: order.customer_email });
    } catch (err) {
        logger.error('Email sending failed', { error: err.message, to: order.customer_email });
    }
}

// ─── MPESA CONFIGURATION ────────────────────────────────────────────────────
const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE,
    MPESA_PASSKEY,
    MPESA_CALLBACK_URL,
    PORT = 3000
} = process.env;

const MPESA_BASE = process.env.NODE_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

async function getAccessToken() {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const res = await fetch(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
    });
    if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

// Pre-check MPesa connectivity
let MPESA_AVAILABLE = false;
(async () => {
    try {
        if (process.env.NODE_ENV === 'production' && MPESA_CONSUMER_KEY) {
            await getAccessToken();
            MPESA_AVAILABLE = true;
            logger.info('MPesa Daraja API connected');
        } else {
            logger.info('MPesa in sandbox mode');
        }
    } catch (err) {
        logger.warn('MPesa connection failed', { error: err.message });
    }
})();

// Admin guard: a verified JWT whose role is "admin". Usable as a middleware
// array on any route, e.g. app.post('/x', adminAuth, handler).
const adminAuth = [authenticate, requireRole('admin')];

// ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────
// Passwords are bcrypt hashes. On success we issue a signed JWT the client sends
// back as `Authorization: Bearer <token>` — roles can no longer be spoofed.

const BCRYPT_ROUNDS = 12;

app.post('/api/auth/register', apiLimiter, asyncHandler(async (req, res) => {
    const { name, email, password, role = 'client', phone = '' } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    // Self-registration cannot create platform admins — they are provisioned/seeded.
    const allowedRoles = ['client', 'dealer', 'liaison'];
    const safeRole = allowedRoles.includes(role) ? role : 'client';

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const password_hash = bcrypt.hashSync(String(password), BCRYPT_ROUNDS);
    const result = db.prepare(
        'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(name.trim(), email.toLowerCase(), password_hash, safeRole, phone || '');

    const user = {
        id: Number(result.lastInsertRowid),
        name: name.trim(),
        email: email.toLowerCase(),
        role: safeRole,
        phone: phone || '',
        dealership_id: null,
    };
    const token = signToken(user);
    return res.status(201).json({ success: true, user, token });
}));

app.post('/api/auth/login', apiLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const user = {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        phone: row.phone,
        dealership_id: row.dealership_id ?? null,
    };
    const token = signToken(user);
    return res.json({ success: true, user, token });
}));

// Return the current user from a valid token (lets the SPA restore session).
app.get('/api/auth/me', authenticate, (req, res) => {
    const row = db.prepare('SELECT id, name, email, role, phone, dealership_id FROM users WHERE id = ?')
        .get(req.user.sub);
    if (!row) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: row });
});

// ─── PASSWORDLESS / OTP LOGIN ────────────────────────────────────────────────
// A user (typically an admin) requests a 6-digit code sent to their phone, then
// exchanges it for a JWT. Codes are stored hashed with a short expiry. Password
// login remains available as a fallback.

const OTP_TTL_MS = 5 * 60 * 1000;

// Find a user by email or by phone (compares the trailing 9 digits, so
// "+254700000001", "0700000001" and "254700000001" all match).
function findUserByIdentifier(identifier) {
    const id = String(identifier).trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(id);
    if (user) return user;
    const digits = id.replace(/\D/g, '');
    if (digits.length >= 9) {
        const tail = digits.slice(-9);
        const rows = db.prepare("SELECT * FROM users WHERE phone IS NOT NULL AND phone != ''").all();
        user = rows.find(r => r.phone.replace(/\D/g, '').endsWith(tail));
    }
    return user || null;
}

/**
 * POST /api/auth/otp/request  { identifier }   (identifier = phone or email)
 * Always responds 200 with a neutral message (never reveals which accounts
 * exist). When a provider isn't configured in dev, the code is returned as
 * `devCode` to make local testing possible.
 */
app.post('/api/auth/otp/request', otpLimiter, asyncHandler(async (req, res) => {
    const { identifier } = req.body || {};
    if (!identifier) {
        return res.status(400).json({ success: false, message: 'Phone number or email is required' });
    }
    const id = String(identifier).trim().toLowerCase();
    const user = findUserByIdentifier(id);

    let devCode;
    if (user) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const code_hash = bcrypt.hashSync(code, 10);
        const expires = new Date(Date.now() + OTP_TTL_MS).toISOString();
        db.prepare('INSERT INTO otp_codes (identifier, user_id, code_hash, expires_at) VALUES (?, ?, ?, ?)')
            .run(id, user.id, code_hash, expires);

        const target = user.phone || user.email;
        const result = await sendSms(target, `Your OmniDrive login code is ${code}. It expires in 5 minutes.`);
        if (result.simulated && process.env.NODE_ENV !== 'production') devCode = code;
        logger.info('OTP issued', { userId: user.id, simulated: result.simulated });
    }

    const body = { success: true, message: 'If an account matches, a login code has been sent.' };
    if (devCode) body.devCode = devCode; // dev convenience only
    return res.json(body);
}));

/**
 * POST /api/auth/otp/verify  { identifier, code }  ->  { user, token }
 */
app.post('/api/auth/otp/verify', otpLimiter, asyncHandler(async (req, res) => {
    const { identifier, code } = req.body || {};
    if (!identifier || !code) {
        return res.status(400).json({ success: false, message: 'Identifier and code are required' });
    }
    const id = String(identifier).trim().toLowerCase();
    const row = db.prepare('SELECT * FROM otp_codes WHERE identifier = ? AND consumed = 0 ORDER BY id DESC LIMIT 1').get(id);
    if (!row) return res.status(400).json({ success: false, message: 'No active code — request a new one' });
    if (new Date(row.expires_at) < new Date()) {
        return res.status(400).json({ success: false, message: 'Code expired — request a new one' });
    }
    if (row.attempts >= 5) {
        return res.status(429).json({ success: false, message: 'Too many attempts — request a new code' });
    }
    if (!bcrypt.compareSync(String(code), row.code_hash)) {
        db.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?').run(row.id);
        return res.status(401).json({ success: false, message: 'Invalid code' });
    }
    db.prepare('UPDATE otp_codes SET consumed = 1 WHERE id = ?').run(row.id);

    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id);
    if (!u) return res.status(401).json({ success: false, message: 'Account not found' });
    const user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, dealership_id: u.dealership_id ?? null };
    const token = signToken(user);
    return res.json({ success: true, user, token });
}));

// ─── MPESA ENDPOINTS ────────────────────────────────────────────────────────

/**
 * POST /api/mpesa/purchase
 * Initiate STK Push for vehicle purchase
 */
app.post('/api/mpesa/purchase',
    mpesaLimiter,
    validateBody(mpesaPurchaseSchema),
    asyncHandler(async (req, res) => {
        const { phone, amount, vehicleName, vehicleId, email } = req.validated;
        const stkAmount = process.env.NODE_ENV === 'production' ? Math.ceil(amount) : 1;

        try {
            const token = await getAccessToken();
            const timestamp = new Date()
                .toISOString()
                .replace(/[-T:.Z]/g, '')
                .slice(0, 14);

            const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

            const stkRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    BusinessShortCode: MPESA_SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: stkAmount,
                    PartyA: phone,
                    PartyB: MPESA_SHORTCODE,
                    PhoneNumber: phone,
                    CallBackURL: MPESA_CALLBACK_URL,
                    AccountReference: `OmniDrive-${vehicleId || 'ORDER'}`,
                    TransactionDesc: vehicleName ? `Purchase: ${vehicleName}` : 'Vehicle Purchase'
                })
            });

            const stkData = await stkRes.json();

            if (stkData.ResponseCode !== '0') {
                logger.warn('STK Push failed', { phone, responseCode: stkData.ResponseCode });
                return res.status(400).json({ success: false, error: stkData.ResponseDescription });
            }

            // Save order to DB (amount stored as integer KES — no float drift)
            db.prepare(`
                INSERT INTO orders (checkout_id, merchant_id, phone, amount, vehicle_id, vehicle_name, customer_email, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            `).run(stkData.CheckoutRequestID, stkData.MerchantRequestID, phone, Math.round(amount), vehicleId || '', vehicleName || '', email || '');

            logger.info('STK Push sent', {
                phone,
                amount,
                vehicleName,
                checkoutId: stkData.CheckoutRequestID
            });

            return res.json({
                success: true,
                checkoutRequestId: stkData.CheckoutRequestID,
                merchantRequestId: stkData.MerchantRequestID
            });

        } catch (err) {
            logger.error('STK Push error', { error: err.message, phone });
            return res.status(500).json({ success: false, error: err.message });
        }
    })
);

/**
 * POST /api/mpesa/callback
 * Handle M-Pesa payment callback
 */
app.post('/api/mpesa/callback', (req, res) => {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (ResultCode === 0) {
        const items = CallbackMetadata?.Item || [];
        const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
        const amount = items.find(i => i.Name === 'Amount')?.Value || 0;

        db.prepare(`
            UPDATE orders SET status='paid', receipt=?, amount=?, updated_at=datetime('now')
            WHERE checkout_id=?
        `).run(receipt, Math.round(Number(amount) || 0), CheckoutRequestID);

        // Send confirmation email
        const order = db.prepare('SELECT * FROM orders WHERE checkout_id=?').get(CheckoutRequestID);
        if (order) sendConfirmationEmail(order);

        logger.info('Payment confirmed', { receipt, checkoutId: CheckoutRequestID });
    } else {
        db.prepare(`UPDATE orders SET status='failed', updated_at=datetime('now') WHERE checkout_id=?`)
            .run(CheckoutRequestID);
        logger.warn('Payment failed', { resultCode: ResultCode, checkoutId: CheckoutRequestID });
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

/**
 * GET /api/mpesa/status/:checkoutRequestId
 * Poll payment status
 */
app.get('/api/mpesa/status/:checkoutRequestId', (req, res) => {
    const order = db.prepare('SELECT status, receipt, amount FROM orders WHERE checkout_id=?')
        .get(req.params.checkoutRequestId);
    return res.json(order || { status: 'pending' });
});

// ─── LISTINGS ENDPOINTS ─────────────────────────────────────────────────────

/**
 * GET /api/listings
 * Get all active listings with filtering
 */
app.get('/api/listings',
    validateQuery(listingQuerySchema),
    asyncHandler((req, res) => {
        const { brand, category, nation, sort, order, page, limit } = req.validated;
        let query = 'SELECT * FROM listings WHERE isActive = 1';
        const params = [];

        if (brand) {
            query += ' AND brand LIKE ?';
            params.push(`%${brand}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (nation) {
            query += ' AND nation = ?';
            params.push(nation);
        }

        const sortColumn = ['price', 'rating', 'createdAt', 'brand', 'model'].includes(sort) ? sort : 'createdAt';
        query += ` ORDER BY ${sortColumn} ${order}`;

        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const listings = db.prepare(query).all(...params);
        const totalCount = db.prepare('SELECT COUNT(*) as count FROM listings WHERE isActive = 1').get().count;

        logger.info('Listings fetched', { count: listings.length, filters: { brand, category, nation } });

        return res.json({
            success: true,
            data: listings,
            pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) }
        });
    })
);

/**
 * GET /api/listings/:id
 * Get single listing
 */
app.get('/api/listings/:id', asyncHandler((req, res) => {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND isActive = 1').get(req.params.id);
    if (!listing) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    return res.json({ success: true, data: listing });
}));

/**
 * POST /api/listings
 * Create new listing (admin only)
 */
app.post('/api/listings',
    adminAuth,
    validateBody(listingCreateSchema),
    asyncHandler((req, res) => {
        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating
        } = req.validated;

        const result = db.prepare(`
            INSERT INTO listings (
                brand, model, price, nation, category, condition,
                body_style, fuel_type, drivetrain, color, city,
                image, badges, specs, rating, dealer_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            brand, model, Math.round(price), nation, category, condition,
            body_style ?? null, fuel_type ?? null, drivetrain ?? null, color ?? null, city ?? 'Nairobi',
            image || null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5,
            (req.user && req.user.email) || ''
        );

        const id = Number(result.lastInsertRowid);
        logger.info('Listing created', { id, brand, model, by: req.user && req.user.email });

        return res.json({ success: true, id, message: 'Listing created successfully' });
    })
);

/**
 * PUT /api/listings/:id
 * Update listing (admin only)
 */
app.put('/api/listings/:id',
    adminAuth,
    validateBody(listingUpdateSchema),
    asyncHandler((req, res) => {
        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating, isActive
        } = req.validated;

        db.prepare(`
            UPDATE listings SET
                brand = ?, model = ?, price = ?, nation = ?, category = ?,
                condition = ?, body_style = ?, fuel_type = ?, drivetrain = ?,
                color = ?, city = ?, image = ?, badges = ?, specs = ?,
                rating = ?, isActive = ?
            WHERE id = ?
        `).run(
            brand, model, Math.round(price), nation, category, condition,
            body_style ?? null, fuel_type ?? null, drivetrain ?? null, color ?? null, city ?? 'Nairobi',
            image || null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5,
            isActive !== undefined ? (isActive ? 1 : 0) : 1,
            Number(req.params.id)
        );

        logger.info('Listing updated', { id: req.params.id });

        return res.json({ success: true, message: 'Listing updated' });
    })
);

/**
 * DELETE /api/listings/:id
 * Soft delete listing (admin only)
 */
app.delete('/api/listings/:id',
    adminAuth,
    asyncHandler((req, res) => {
        db.prepare('UPDATE listings SET isActive = 0 WHERE id = ?').run(req.params.id);
        logger.info('Listing deleted', { id: req.params.id });
        return res.json({ success: true, message: 'Listing deleted' });
    })
);

// ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

// Admin token verification endpoint — confirms the caller holds a valid admin JWT.
app.post('/api/admin/verify', adminAuth, (req, res) => {
    return res.json({ success: true, user: { email: req.user.email, role: req.user.role } });
});

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
app.get('/api/admin/stats', adminAuth, asyncHandler((req, res) => {
    const stats = getDatabaseStats(db);
    logger.info('Admin stats retrieved');
    return res.json({ success: true, data: stats });
}));

/**
 * GET /api/admin/orders
 * Get all orders
 */
app.get('/api/admin/orders', adminAuth, asyncHandler((req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    logger.info('Admin orders retrieved', { count: orders.length });
    return res.json({ success: true, data: orders });
}));

/**
 * GET /api/admin/orders/:id
 * Get single order
 */
app.get('/api/admin/orders/:id', adminAuth, asyncHandler((req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Not found' });
    }
    return res.json({ success: true, data: order });
}));

// ─── DEALER MANAGEMENT ──────────────────────────────────────────────────────

/**
 * POST /api/dealer/register
 * Register as a dealer
 */
app.post('/api/dealer/register',
    apiLimiter,
    validateBody(dealerRegisterSchema),
    asyncHandler((req, res) => {
        const { name, owner, phone, email, city, address, types, plan, about, payment } = req.validated;

        db.prepare(`
            INSERT INTO dealer_applications (name, owner, phone, email, city, address, types, plan, about, payment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, owner, phone, email, city, address || '', types || '', plan, about || '', payment || 'mpesa');

        logger.info('Dealer application submitted', { email, name });

        return res.json({ success: true, message: 'Application received' });
    })
);

/**
 * GET /api/admin/dealers
 * Get all dealer applications
 */
app.get('/api/admin/dealers', adminAuth, asyncHandler((req, res) => {
    const dealers = db.prepare('SELECT * FROM dealer_applications ORDER BY created_at DESC').all();
    logger.info('Dealer applications retrieved', { count: dealers.length });
    return res.json({ success: true, data: dealers });
}));

/**
 * PATCH /api/admin/dealers/:id
 * Approve/reject dealer application
 */
app.patch('/api/admin/dealers/:id',
    adminAuth,
    validateBody(adminActionSchema),
    asyncHandler(async (req, res) => {
        const { status } = req.validated;

        db.prepare('UPDATE dealer_applications SET status=? WHERE id=?').run(status, req.params.id);
        const dealer = db.prepare('SELECT * FROM dealer_applications WHERE id=?').get(req.params.id);

        if (dealer?.email && process.env.SMTP_USER) {
            const isApproved = status === 'approved';
            await mailer.sendMail({
                from: `"OmniDrive" <${process.env.SMTP_USER}>`,
                to: dealer.email,
                subject: isApproved ? 'Welcome to OmniDrive — Your Dealership is Live!' : 'OmniDrive Application Update',
                html: isApproved ? `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                        <h2 style="color:#e47911">Welcome to OmniDrive, ${dealer.name}!</h2>
                        <p>Your dealership application has been <strong>approved</strong>. You are now a verified OmniDrive partner.</p>
                        <p>Visit <a href="https://omnidrive.co.ke">omnidrive.co.ke</a> to start listing your vehicles.</p>
                    </div>` : `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                        <h2>OmniDrive Application Update</h2>
                        <p>Hi ${dealer.name}, unfortunately your dealership application was not approved.</p>
                    </div>`
            }).catch(e => logger.error('Dealer email failed', { error: e.message }));
        }

        logger.info('Dealer application updated', { id: req.params.id, status });

        return res.json({ success: true });
    })
);

// ─── PENDING LISTINGS ──────────────────────────────────────────────────────

/**
 * POST /api/listings/submit
 * Submit pending listing for approval
 */
app.post('/api/listings/submit',
    apiLimiter,
    validateBody(pendingListingSchema),
    asyncHandler((req, res) => {
        const { listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller } = req.validated;

        db.prepare(`
            INSERT OR IGNORE INTO pending_listings
            (listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller_name, seller_phone, seller_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            listing_id || ('PND' + Date.now()),
            brand, model, Math.round(price), year ?? null, category ?? null, condition ?? null,
            mileage || 0, fuel ?? null, city || '', description || '', img || '',
            seller.name, seller.phone, seller.email || ''
        );

        logger.info('Pending listing submitted', { brand, model, email: seller.email });

        return res.json({ success: true });
    })
);

/**
 * GET /api/admin/listings
 * Get pending listings
 */
app.get('/api/admin/listings', adminAuth, asyncHandler((req, res) => {
    const listings = db.prepare('SELECT * FROM pending_listings ORDER BY created_at DESC').all();
    logger.info('Pending listings retrieved', { count: listings.length });
    return res.json({ success: true, data: listings });
}));

/**
 * PATCH /api/admin/listings/:id
 * Approve/reject pending listing
 */
app.patch('/api/admin/listings/:id',
    adminAuth,
    validateBody(adminActionSchema),
    asyncHandler(async (req, res) => {
        const { status } = req.validated;

        db.prepare('UPDATE pending_listings SET status=? WHERE id=?').run(status, req.params.id);
        const listing = db.prepare('SELECT * FROM pending_listings WHERE id=?').get(req.params.id);

        if (listing?.seller_email && process.env.SMTP_USER) {
            await mailer.sendMail({
                from: `"OmniDrive" <${process.env.SMTP_USER}>`,
                to: listing.seller_email,
                subject: status === 'approved' ? `Your ${listing.brand} ${listing.model} is now live on OmniDrive!` : 'OmniDrive Listing Update',
                html: status === 'approved' ? `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                        <h2 style="color:#e47911">Your listing is live!</h2>
                        <p>Your <strong>${listing.brand} ${listing.model}</strong> is now visible to thousands of buyers.</p>
                    </div>` : `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                        <p>Your listing for <strong>${listing.brand} ${listing.model}</strong> was not approved.</p>
                    </div>`
            }).catch(e => logger.error('Listing email failed', { error: e.message }));
        }

        logger.info('Pending listing updated', { id: req.params.id, status });

        return res.json({ success: true });
    })
);

// ─── CHAT SYSTEM ────────────────────────────────────────────────────────────

try {
    const chatRoutes = require('./routes/chatRoutes');
    app.use('/api/chat', chatRoutes(db, authenticate));
    logger.info('Chat routes mounted');
} catch (chatError) {
    logger.error('Failed to mount chat routes', { error: chatError.message });
}

// ─── FILE UPLOADS ──────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
    storage: multer.diskStorage({
        destination: (_, __, cb) => cb(null, uploadDir),
        filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use('/uploads', express.static(uploadDir));

app.post('/api/chat/upload', upload.single('file'), asyncHandler((req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    return res.json({
        success: true,
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname,
        isImage: req.file.mimetype.startsWith('image/')
    });
}));

// ─── HEALTH CHECK & SERVER START ────────────────────────────────────────────

app.get('/health', (_, res) => res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
}));

// Mount dashboard routes
try {
    const dashboardRoutes = require('./routes/dashboardRoutes');
    const router = dashboardRoutes(db, authenticate);
    app.use('/api', router);
    logger.info('Dashboard routes mounted');
} catch (routeError) {
    logger.error('Failed to mount dashboard routes', { error: routeError.message });
}

// ─── PHASE 2: REAL-TIME NOTIFICATIONS & BACKGROUND JOBS ──────────────────

// Create HTTP server for WebSocket support
const httpServer = http.createServer(app);

// Initialize Queue Manager
let queueManager;
try {
    queueManager = new QueueManager();
    logger.info('Queue manager initialized');
} catch (error) {
    logger.warn('Queue manager initialization failed', { error: error.message });
    logger.info('Continuing without background job processing');
}

// Initialize WebSocket Manager
let wsManager;
try {
    wsManager = new WebSocketManager(httpServer, null);
    logger.info('WebSocket manager initialized');
} catch (error) {
    logger.warn('WebSocket manager initialization failed', { error: error.message });
}

// Initialize Inventory Sync Service
let inventorySync;
try {
    inventorySync = new InventorySyncService(db, queueManager, wsManager);

    // Register example sources (configure based on env)
    if (process.env.EXTERNAL_SOURCE_ENDPOINT) {
        inventorySync.registerSource('external-1', {
            name: 'External Inventory Source',
            endpoint: process.env.EXTERNAL_SOURCE_ENDPOINT,
            apiKey: process.env.EXTERNAL_SOURCE_API_KEY,
            syncInterval: 3600000, // 1 hour
        });
    }

    logger.info('Inventory sync service initialized');
} catch (error) {
    logger.warn('Inventory sync service initialization failed', { error: error.message });
}

// Mount inventory sync routes BEFORE 404 handler
if (inventorySync && queueManager) {
    const inventorySyncRoutes = require('./routes/inventorySyncRoutes');
    app.use('/api/inventory-sync', inventorySyncRoutes(db, inventorySync, queueManager));
    logger.info('Inventory sync routes mounted');
}

// SPA catch-all: every non-API navigation returns the app shell (index.html),
// so deep links and refreshes work — and the site NEVER falls back to a
// directory listing or a JSON 404 for a normal page request.
const SPA_INDEX = path.join(reactBuildPath, 'index.html');
const FALLBACK_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1"><title>OmniDrive</title></head>`
    + `<body style="font-family:system-ui,sans-serif;background:#0d1117;color:#e6edf3;display:flex;`
    + `min-height:100vh;align-items:center;justify-content:center;text-align:center;margin:0">`
    + `<div><h1 style="color:#e47911;margin:0 0 .5rem">OmniDrive</h1>`
    + `<p>The web app build was not found. Run <code>cd web &amp;&amp; npm install &amp;&amp; npm run build</code> then reload.</p>`
    + `</div></body></html>`;

app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    if (fs.existsSync(SPA_INDEX)) return res.sendFile(SPA_INDEX);
    // Build missing: return a clean HTML page (200) instead of a directory/404.
    return res.status(200).type('html').send(FALLBACK_HTML);
});

// 404 handler (API routes only — SPA catch-all handles frontend routes above)
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
    });
});

// Global error handler
app.use(errorHandler);

// Start server with HTTP support (for WebSocket)
const server = httpServer.listen(PORT, () => {
    logger.info('OmniDrive Backend Started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        mpesaBase: MPESA_BASE,
        databasePath: dbPath,
        apiDocs: `http://localhost:${PORT}/api-docs`,
        websocket: wsManager ? 'enabled' : 'disabled',
        queues: queueManager ? 'enabled' : 'disabled',
        inventorySync: inventorySync ? 'enabled' : 'disabled',
    });

    console.log(`\n OmniDrive backend running on http://localhost:${PORT}`);
    console.log(` API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(` WebSocket: ${wsManager ? ' Enabled' : ' Disabled'}`);
    console.log(` Background Jobs: ${queueManager ? ' Enabled' : ' Disabled'}`);
    console.log(` Inventory Sync: ${inventorySync ? ' Enabled' : ' Disabled'}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` MPesa: ${MPESA_BASE}`);
    console.log(` Database: ${dbPath}\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing server');

    // Shutdown WebSocket
    if (wsManager) {
        wsManager.shutdown();
    }

    // Shutdown Queue Manager
    if (queueManager) {
        await queueManager.shutdown();
    }

    server.close(() => {
        logger.info('HTTP server closed');
        db.close();
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
});

module.exports = app;
