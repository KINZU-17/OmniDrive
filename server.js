require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const webpush = require('web-push');
const multer  = require('multer');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const mpesaLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { success: false, error: 'Too many requests, please try again later.' } });
const apiLimiter  = rateLimit({ windowMs: 60 * 1000, max: 60 });

// ─── DATABASE SETUP ────────────────────────────────────────────────────────
const db = new Database('omnidrive.db');

db.exec(`
    -- Active vehicle listings (publicly visible)
    CREATE TABLE IF NOT EXISTS listings (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        brand            TEXT NOT NULL,
        model            TEXT NOT NULL,
        price            REAL NOT NULL,
        nation           TEXT NOT NULL,
        category         TEXT DEFAULT 'Car',
        condition        TEXT DEFAULT 'Used',
        body_style       TEXT,
        fuel_type        TEXT,
        drivetrain       TEXT,
        color            TEXT,
        city             TEXT DEFAULT 'Nairobi',
        image            TEXT,
        badges           TEXT DEFAULT '[]',
        specs            TEXT DEFAULT '{}',
        rating           REAL DEFAULT 4.5,
        reviewCount      INTEGER DEFAULT 0,
        createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
        isActive         BOOLEAN DEFAULT 1
    );

    -- Orders / Transactions
    CREATE TABLE IF NOT EXISTS orders (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        checkout_id      TEXT UNIQUE,
        merchant_id      TEXT,
        phone            TEXT,
        amount           REAL,
        vehicle_id       TEXT,
        vehicle_name     TEXT,
        status           TEXT DEFAULT 'pending',
        receipt          TEXT,
        customer_email   TEXT,
        created_at       TEXT DEFAULT (datetime('now')),
        updated_at       TEXT DEFAULT (datetime('now'))
    );
`);

// ─── EMAIL SETUP ───────────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
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
            from:    `"OmniDrive" <${process.env.SMTP_USER}>`,
            to:      order.customer_email,
            subject: `✅ Payment Confirmed – ${order.vehicle_name}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                    <h2 style="color:#e47911">🚗 OmniDrive – Payment Confirmed!</h2>
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
        console.log(`[Email] Confirmation sent to ${order.customer_email}`);
    } catch (err) {
        console.error('[Email] Failed:', err.message);
    }
}

// ─── MPESA HELPERS ─────────────────────────────────────────────────────────
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

// ─── 1. STK PUSH ──────────────────────────────────────────────────────────
app.post('/api/mpesa/purchase', mpesaLimiter, async (req, res) => {
    const { phone, amount, vehicleName, vehicleId, email } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ success: false, error: 'phone and amount are required' });
    }

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
                Password:          password,
                Timestamp:         timestamp,
                TransactionType:   'CustomerPayBillOnline',
                Amount:            stkAmount,
                PartyA:            phone,
                PartyB:            MPESA_SHORTCODE,
                PhoneNumber:       phone,
                CallBackURL:       MPESA_CALLBACK_URL,
                AccountReference:  `OmniDrive-${vehicleId || 'ORDER'}`,
                TransactionDesc:   vehicleName ? `Purchase: ${vehicleName}` : 'Vehicle Purchase'
            })
        });

        const stkData = await stkRes.json();

        if (stkData.ResponseCode !== '0') {
            return res.status(400).json({ success: false, error: stkData.ResponseDescription });
        }

        // Save order to DB
        db.prepare(`
            INSERT INTO orders (checkout_id, merchant_id, phone, amount, vehicle_id, vehicle_name, customer_email, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `).run(stkData.CheckoutRequestID, stkData.MerchantRequestID, phone, amount, vehicleId || '', vehicleName || '', email || '');

        console.log(`[STK Push] Sent to ${phone} for ${vehicleName} | CheckoutID: ${stkData.CheckoutRequestID}`);

        return res.json({
            success: true,
            checkoutRequestId: stkData.CheckoutRequestID,
            merchantRequestId: stkData.MerchantRequestID
        });

    } catch (err) {
        console.error('[STK Push error]', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── 2. MPESA CALLBACK ────────────────────────────────────────────────────
app.post('/api/mpesa/callback', (req, res) => {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (ResultCode === 0) {
        const items   = CallbackMetadata?.Item || [];
        const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
        const amount  = items.find(i => i.Name === 'Amount')?.Value || 0;

        db.prepare(`
            UPDATE orders SET status='paid', receipt=?, amount=?, updated_at=datetime('now')
            WHERE checkout_id=?
        `).run(receipt, amount, CheckoutRequestID);

        // Send confirmation email
        const order = db.prepare('SELECT * FROM orders WHERE checkout_id=?').get(CheckoutRequestID);
        if (order) sendConfirmationEmail(order);

        console.log(`[Callback] Payment CONFIRMED | Receipt: ${receipt} | CheckoutID: ${CheckoutRequestID}`);
    } else {
        db.prepare(`UPDATE orders SET status='failed', updated_at=datetime('now') WHERE checkout_id=?`)
          .run(CheckoutRequestID);
        console.log(`[Callback] Payment FAILED | ResultCode: ${ResultCode} | CheckoutID: ${CheckoutRequestID}`);
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ─── 3. POLL STATUS ───────────────────────────────────────────────────────
app.get('/api/mpesa/status/:checkoutRequestId', (req, res) => {
    const order = db.prepare('SELECT status, receipt, amount FROM orders WHERE checkout_id=?')
                    .get(req.params.checkoutRequestId);
    if (!order) return res.json({ status: 'pending' });
    return res.json(order);
});

// ─── 4. ADMIN API ─────────────────────────────────────────────────────────
function adminAuth(req, res, next) {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// All orders
app.get('/api/admin/orders', adminAuth, (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return res.json(orders);
});

// Stats summary
app.get('/api/admin/stats', adminAuth, (req, res) => {
    const total    = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
    const paid     = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='paid'").get().c;
    const pending  = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='pending'").get().c;
    const failed   = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='failed'").get().c;
    const revenue  = db.prepare("SELECT SUM(amount) as s FROM orders WHERE status='paid'").get().s || 0;
    return res.json({ total, paid, pending, failed, revenue });
});

// Single order
app.get('/api/admin/orders/:id', adminAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    return res.json(order);
});

// ─── LISTINGS MANAGEMENT ────────────────────────────────────────────────────

// Get all active listings (public)
app.get('/api/listings', (req, res) => {
    try {
        const { brand, category, nation, sort = 'createdAt', order = 'DESC' } = req.query;
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

        // Sorting
        const validSorts = ['price', 'rating', 'createdAt', 'brand', 'model'];
        const validOrder = ['ASC', 'DESC'];
        const sortColumn = validSorts.includes(sort) ? sort : 'createdAt';
        const sortDirection = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
        query += ` ORDER BY ${sortColumn} ${sortDirection}`;

        const listings = db.prepare(query).all(...params);
        return res.json({ success: true, data: listings });
    } catch (err) {
        console.error('Error fetching listings:', err);
        return res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Get single listing by ID
app.get('/api/listings/:id', (req, res) => {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND isActive = 1').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    return res.json({ success: true, data: listing });
});

// Admin: Add new listing
app.post('/api/listings', adminAuth, (req, res) => {
    try {
        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating
        } = req.body;

        const stmt = db.prepare(`
            INSERT INTO listings (
                brand, model, price, nation, category, condition,
                body_style, fuel_type, drivetrain, color, city,
                image, badges, specs, rating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image ? JSON.stringify(image) : null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5
        );

        return res.json({
            success: true,
            id: result.lastInsertRowid,
            message: 'Listing created successfully'
        });
    } catch (err) {
        console.error('Error creating listing:', err);
        return res.status(500).json({ error: 'Failed to create listing' });
    }
});

// Admin: Update listing
app.put('/api/listings/:id', adminAuth, (req, res) => {
    try {
        const { id } = req.params;
        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating, isActive
        } = req.body;

        const stmt = db.prepare(`
            UPDATE listings SET
                brand = ?, model = ?, price = ?, nation = ?, category = ?,
                condition = ?, body_style = ?, fuel_type = ?, drivetrain = ?,
                color = ?, city = ?, image = ?, badges = ?, specs = ?,
                rating = ?, isActive = ?
            WHERE id = ?
        `);

        stmt.run(
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image ? JSON.stringify(image) : null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5,
            isActive !== undefined ? (isActive ? 1 : 0) : 1,
            id
        );

        return res.json({ success: true, message: 'Listing updated' });
    } catch (err) {
        console.error('Error updating listing:', err);
        return res.status(500).json({ error: 'Failed to update listing' });
    }
});

// Admin: Delete listing (soft delete)
app.delete('/api/listings/:id', adminAuth, (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('UPDATE listings SET isActive = 0 WHERE id = ?').run(id);
        return res.json({ success: true, message: 'Listing deleted' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to delete listing' });
    }
});

// ─── 5. DEALER REGISTRATION ───────────────────────────────────────────────
db.exec(`
    CREATE TABLE IF NOT EXISTS dealer_applications (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT,
        owner       TEXT,
        phone       TEXT,
        email       TEXT,
        city        TEXT,
        address     TEXT,
        types       TEXT,
        plan        TEXT,
        about       TEXT,
        payment     TEXT,
        status      TEXT DEFAULT 'pending',
        created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS pending_listings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id  TEXT UNIQUE,
        brand       TEXT,
        model       TEXT,
        price       REAL,
        year        INTEGER,
        category    TEXT,
        condition   TEXT,
        mileage     INTEGER,
        fuel        TEXT,
        city        TEXT,
        description TEXT,
        img         TEXT,
        seller_name  TEXT,
        seller_phone TEXT,
        seller_email TEXT,
        status      TEXT DEFAULT 'pending',
        created_at  TEXT DEFAULT (datetime('now'))
    );
`);

app.post('/api/dealer/register', apiLimiter, (req, res) => {
    const { name, owner, phone, email, city, address, types, plan, about, payment } = req.body;
    if (!name || !owner || !phone || !email || !city || !plan) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    db.prepare(`
        INSERT INTO dealer_applications (name, owner, phone, email, city, address, types, plan, about, payment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, owner, phone, email, city, address || '', types || '', plan, about || '', payment || 'mpesa');
    return res.json({ success: true, message: 'Application received' });
});

app.get('/api/admin/dealers', adminAuth, (req, res) => {
    const dealers = db.prepare('SELECT * FROM dealer_applications ORDER BY created_at DESC').all();
    return res.json(dealers);
});

app.patch('/api/admin/dealers/:id', adminAuth, async (req, res) => {
    const { status } = req.body;
    if (!['pending','approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    db.prepare('UPDATE dealer_applications SET status=? WHERE id=?').run(status, req.params.id);
    const dealer = db.prepare('SELECT * FROM dealer_applications WHERE id=?').get(req.params.id);
    if (dealer?.email && process.env.SMTP_USER) {
        const isApproved = status === 'approved';
        await mailer.sendMail({
            from: `"OmniDrive" <${process.env.SMTP_USER}>`,
            to: dealer.email,
            subject: isApproved ? '🎉 Welcome to OmniDrive — Your Dealership is Live!' : 'OmniDrive Application Update',
            html: isApproved ? `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                    <h2 style="color:#e47911">🚗 Welcome to OmniDrive, ${dealer.name}!</h2>
                    <p>Your dealership application has been <strong>approved</strong>. You are now a verified OmniDrive partner.</p>
                    <table style="width:100%;border-collapse:collapse;margin:20px 0">
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Plan</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${dealer.plan}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>City</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${dealer.city}</td></tr>
                        <tr><td style="padding:8px"><strong>Contact</strong></td><td style="padding:8px">${dealer.phone}</td></tr>
                    </table>
                    <p>Visit <a href="https://omnidrive.co.ke">omnidrive.co.ke</a> to start listing your vehicles.</p>
                    <p style="color:#888;font-size:0.85rem">OmniDrive.co.ke — Connecting you to the drive of your choice</p>
                </div>` : `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                    <h2>OmniDrive Application Update</h2>
                    <p>Hi ${dealer.name}, unfortunately your dealership application was not approved at this time.</p>
                    <p>Please contact us at info@omnidrive.co.ke for more information.</p>
                </div>`
        }).catch(e => console.error('[Email] Dealer approval email failed:', e.message));
    }
    return res.json({ success: true });
});

app.post('/api/listings/submit', apiLimiter, (req, res) => {
    const { listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller } = req.body;
    if (!brand || !model || !price || !seller?.name || !seller?.phone) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    db.prepare(`
        INSERT OR IGNORE INTO pending_listings
        (listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller_name, seller_phone, seller_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(listing_id || ('PND' + Date.now()), brand, model, price, year, category, condition, mileage || 0, fuel, city || '', description || '', img || '', seller.name, seller.phone, seller.email || '');
    return res.json({ success: true });
});

app.get('/api/admin/listings', adminAuth, (req, res) => {
    const listings = db.prepare('SELECT * FROM pending_listings ORDER BY created_at DESC').all();
    return res.json(listings);
});

app.patch('/api/admin/listings/:id', adminAuth, async (req, res) => {
    const { status } = req.body;
    if (!['pending','approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    db.prepare('UPDATE pending_listings SET status=? WHERE id=?').run(status, req.params.id);
    const listing = db.prepare('SELECT * FROM pending_listings WHERE id=?').get(req.params.id);
    if (listing?.seller_email && process.env.SMTP_USER) {
        await mailer.sendMail({
            from: `"OmniDrive" <${process.env.SMTP_USER}>`,
            to: listing.seller_email,
            subject: status === 'approved' ? `✅ Your ${listing.brand} ${listing.model} is now live on OmniDrive!` : 'OmniDrive Listing Update',
            html: status === 'approved' ? `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                    <h2 style="color:#e47911">🚗 Your listing is live!</h2>
                    <p>Your <strong>${listing.brand} ${listing.model} (${listing.year})</strong> is now visible to thousands of buyers on OmniDrive.</p>
                    <p>Buyers can contact you directly at <strong>${listing.seller_phone}</strong>.</p>
                    <p style="color:#888;font-size:0.85rem">OmniDrive.co.ke</p>
                </div>` : `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                    <h2>OmniDrive Listing Update</h2>
                    <p>Your listing for <strong>${listing.brand} ${listing.model}</strong> was not approved. Contact info@omnidrive.co.ke for details.</p>
                </div>`
        }).catch(e => console.error('[Email] Listing approval email failed:', e.message));
    }
    return res.json({ success: true });
});

// ─── 6. MESSAGING ────────────────────────────────────────────────────────
db.exec(`
    CREATE TABLE IF NOT EXISTS chat_users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        email      TEXT UNIQUE NOT NULL,
        role       TEXT DEFAULT 'client',  -- 'client' | 'dealer' | 'admin'
        avatar     TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_rooms (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        type        TEXT DEFAULT 'direct', -- 'direct' | 'group'
        created_by  INTEGER,
        created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_room_members (
        room_id INTEGER,
        user_id INTEGER,
        PRIMARY KEY (room_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id    INTEGER NOT NULL,
        sender_id  INTEGER NOT NULL,
        body       TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (room_id)   REFERENCES chat_rooms(id),
        FOREIGN KEY (sender_id) REFERENCES chat_users(id)
    );
    CREATE TABLE IF NOT EXISTS chat_reads (
        room_id    INTEGER,
        user_id    INTEGER,
        last_read  TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (room_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS chat_presence (
        user_id    INTEGER PRIMARY KEY,
        last_seen  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS push_subscriptions (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER,
        endpoint   TEXT UNIQUE,
        p256dh     TEXT,
        auth       TEXT
    );
    CREATE TABLE IF NOT EXISTS msg_read_receipts (
        msg_id     INTEGER,
        user_id    INTEGER,
        read_at    TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (msg_id, user_id)
    );
`);

// File uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({
    storage: multer.diskStorage({
        destination: (_, __, cb) => cb(null, uploadDir),
        filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_')}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});
app.use('/uploads', express.static(uploadDir));
app.post('/api/chat/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    return res.json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname, isImage: req.file.mimetype.startsWith('image/') });
});

// Web Push
if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
    const keys = webpush.generateVAPIDKeys();
    console.log('\n⚠️  Add to .env: VAPID_PUBLIC=' + keys.publicKey + '  VAPID_PRIVATE=' + keys.privateKey + '\n');
    process.env.VAPID_PUBLIC  = keys.publicKey;
    process.env.VAPID_PRIVATE = keys.privateKey;
}
webpush.setVapidDetails('mailto:info@omnidrive.co.ke', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
app.get('/api/chat/push/vapid-key', (_, res) => res.json({ key: process.env.VAPID_PUBLIC }));
app.post('/api/chat/push/subscribe', (req, res) => {
    const { user_id, subscription } = req.body;
    if (!user_id || !subscription?.endpoint) return res.status(400).json({ error: 'missing fields' });
    db.prepare('INSERT OR REPLACE INTO push_subscriptions (user_id,endpoint,p256dh,auth) VALUES (?,?,?,?)')
      .run(user_id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth);
    return res.json({ ok: true });
});

// Seed admin user if not exists
db.prepare(`INSERT OR IGNORE INTO chat_users (name, email, role) VALUES ('OmniDrive Admin', 'admin@omnidrive.co.ke', 'admin')`).run();

// Register / login (upsert by email)
app.post('/api/chat/auth', apiLimiter, (req, res) => {
    const { name, email, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const allowed = ['client', 'dealer'];
    const userRole = allowed.includes(role) ? role : 'client';
    let user = db.prepare('SELECT * FROM chat_users WHERE email=?').get(email);
    if (!user) {
        const info = db.prepare('INSERT INTO chat_users (name, email, role) VALUES (?,?,?)').run(name, email, userRole);
        user = db.prepare('SELECT * FROM chat_users WHERE id=?').get(info.lastInsertRowid);
    }
    return res.json(user);
});

// Admin auth as chat user
app.post('/api/chat/admin-auth', (req, res) => {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
    const user = db.prepare(`SELECT * FROM chat_users WHERE role='admin' LIMIT 1`).get();
    return res.json(user);
});

// List all users (for starting a conversation) — dealers & admin visible to all
app.get('/api/chat/users', (req, res) => {
    const users = db.prepare(`SELECT id, name, email, role, avatar FROM chat_users ORDER BY role, name`).all();
    return res.json(users);
});

// Get or create a direct room between two users
app.post('/api/chat/rooms/direct', apiLimiter, (req, res) => {
    const { user_a, user_b } = req.body;
    if (!user_a || !user_b) return res.status(400).json({ error: 'user_a and user_b required' });
    // Find existing direct room shared by both
    const existing = db.prepare(`
        SELECT r.* FROM chat_rooms r
        JOIN chat_room_members m1 ON m1.room_id=r.id AND m1.user_id=?
        JOIN chat_room_members m2 ON m2.room_id=r.id AND m2.user_id=?
        WHERE r.type='direct' LIMIT 1
    `).get(user_a, user_b);
    if (existing) return res.json(existing);
    const uA = db.prepare('SELECT name FROM chat_users WHERE id=?').get(user_a);
    const uB = db.prepare('SELECT name FROM chat_users WHERE id=?').get(user_b);
    const room = db.prepare(`INSERT INTO chat_rooms (name, type, created_by) VALUES (?,?,?)`)
        .run(`${uA?.name} & ${uB?.name}`, 'direct', user_a);
    const roomId = room.lastInsertRowid;
    db.prepare('INSERT OR IGNORE INTO chat_room_members (room_id, user_id) VALUES (?,?)').run(roomId, user_a);
    db.prepare('INSERT OR IGNORE INTO chat_room_members (room_id, user_id) VALUES (?,?)').run(roomId, user_b);
    return res.json(db.prepare('SELECT * FROM chat_rooms WHERE id=?').get(roomId));
});

// Create a group room (dealers + admin)
app.post('/api/chat/rooms/group', apiLimiter, (req, res) => {
    const { name, created_by, member_ids } = req.body;
    if (!name || !created_by || !Array.isArray(member_ids)) return res.status(400).json({ error: 'name, created_by, member_ids required' });
    const room = db.prepare(`INSERT INTO chat_rooms (name, type, created_by) VALUES (?,?,?)`).run(name, 'group', created_by);
    const roomId = room.lastInsertRowid;
    const addMember = db.prepare('INSERT OR IGNORE INTO chat_room_members (room_id, user_id) VALUES (?,?)');
    [...new Set([created_by, ...member_ids])].forEach(uid => addMember.run(roomId, uid));
    return res.json(db.prepare('SELECT * FROM chat_rooms WHERE id=?').get(roomId));
});

// List rooms for a user
app.get('/api/chat/rooms/:userId', (req, res) => {
    const rooms = db.prepare(`
        SELECT r.*, 
            (SELECT body FROM chat_messages WHERE room_id=r.id ORDER BY created_at DESC LIMIT 1) as last_msg,
            (SELECT created_at FROM chat_messages WHERE room_id=r.id ORDER BY created_at DESC LIMIT 1) as last_msg_at,
            (SELECT COUNT(*) FROM chat_messages m
             LEFT JOIN chat_reads cr ON cr.room_id=m.room_id AND cr.user_id=?
             WHERE m.room_id=r.id AND (cr.last_read IS NULL OR m.created_at > cr.last_read)
             AND m.sender_id != ?) as unread
        FROM chat_rooms r
        JOIN chat_room_members rm ON rm.room_id=r.id AND rm.user_id=?
        ORDER BY COALESCE(last_msg_at, r.created_at) DESC
    `).all(req.params.userId, req.params.userId, req.params.userId);
    return res.json(rooms);
});

// Presence heartbeat
app.post('/api/chat/presence', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    db.prepare(`INSERT OR REPLACE INTO chat_presence (user_id, last_seen) VALUES (?,datetime('now'))`).run(user_id);
    return res.json({ ok: true });
});
app.get('/api/chat/online', (_, res) => {
    const online = db.prepare(`SELECT user_id FROM chat_presence WHERE last_seen >= datetime('now','-30 seconds')`).all().map(r => r.user_id);
    return res.json(online);
});

// Get messages in a room
app.get('/api/chat/messages/:roomId', (req, res) => {
    const { userId } = req.query;
    const msgs = db.prepare(`
        SELECT m.*, u.name as sender_name, u.role as sender_role, u.avatar as sender_avatar
        FROM chat_messages m JOIN chat_users u ON u.id=m.sender_id
        WHERE m.room_id=? ORDER BY m.created_at ASC LIMIT 200
    `).all(req.params.roomId);
    if (userId) {
        db.prepare(`INSERT OR REPLACE INTO chat_reads (room_id,user_id,last_read) VALUES (?,?,datetime('now'))`).run(req.params.roomId, userId);
        const markRead = db.prepare('INSERT OR IGNORE INTO msg_read_receipts (msg_id,user_id) VALUES (?,?)');
        msgs.forEach(m => { if (m.sender_id !== parseInt(userId)) markRead.run(m.id, userId); });
    }
    const withReceipts = msgs.map(m => ({
        ...m,
        read_by: db.prepare(`SELECT u.name FROM msg_read_receipts r JOIN chat_users u ON u.id=r.user_id WHERE r.msg_id=?`).all(m.id).map(r => r.name)
    }));
    return res.json(withReceipts);
});

// Send a message
app.post('/api/chat/messages', apiLimiter, (req, res) => {
    const { room_id, sender_id, body, file_url, file_name, is_image } = req.body;
    if (!room_id || !sender_id || (!body?.trim() && !file_url)) return res.status(400).json({ error: 'missing fields' });
    const member = db.prepare('SELECT 1 FROM chat_room_members WHERE room_id=? AND user_id=?').get(room_id, sender_id);
    if (!member) return res.status(403).json({ error: 'Not a member of this room' });
    const msgBody = file_url
        ? (is_image ? `[img:${file_url}:${file_name}]` : `[file:${file_url}:${file_name}]`)
        : body.trim();
    const info = db.prepare('INSERT INTO chat_messages (room_id,sender_id,body) VALUES (?,?,?)').run(room_id, sender_id, msgBody);
    const msg = db.prepare(`SELECT m.*,u.name as sender_name,u.role as sender_role FROM chat_messages m JOIN chat_users u ON u.id=m.sender_id WHERE m.id=?`).get(info.lastInsertRowid);
    // Push notify other members
    const sender = db.prepare('SELECT name FROM chat_users WHERE id=?').get(sender_id);
    db.prepare('SELECT user_id FROM chat_room_members WHERE room_id=? AND user_id!=?').all(room_id, sender_id).forEach(({ user_id }) => {
        db.prepare('SELECT * FROM push_subscriptions WHERE user_id=?').all(user_id).forEach(sub => {
            webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({ title: `💬 ${sender?.name || 'OmniDrive'}`, body: file_url ? '📎 Sent a file' : msgBody.slice(0,80), url: '/messaging.html' })
            ).catch(() => db.prepare('DELETE FROM push_subscriptions WHERE endpoint=?').run(sub.endpoint));
        });
    });
    return res.json({ ...msg, read_by: [] });
});

// Admin: list all rooms
app.get('/api/admin/chat/rooms', adminAuth, (req, res) => {
    const rooms = db.prepare(`SELECT r.*, COUNT(m.id) as msg_count FROM chat_rooms r LEFT JOIN chat_messages m ON m.room_id=r.id GROUP BY r.id ORDER BY r.created_at DESC`).all();
    return res.json(rooms);
});

// ─── 7. PUSH NOTIFICATIONS ────────────────────────────────────────────────
db.exec(`
    CREATE TABLE IF NOT EXISTS push_tokens (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        token      TEXT UNIQUE,
        user_email TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
`);

// Register device push token
app.post('/api/push/register', apiLimiter, (req, res) => {
    const { token, email } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    db.prepare('INSERT OR REPLACE INTO push_tokens (token, user_email) VALUES (?, ?)').run(token, email || '');
    return res.json({ success: true });
});

// Send push notification (admin only)
app.post('/api/push/send', adminAuth, async (req, res) => {
    const { title, body, data, tokens } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body required' });

    const targetTokens = tokens || db.prepare('SELECT token FROM push_tokens').all().map(r => r.token);
    if (!targetTokens.length) return res.json({ success: true, sent: 0 });

    const messages = targetTokens.map(to => ({ to, title, body, data: data || {}, sound: 'default' }));

    try {
        const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(messages)
        });
        const result = await pushRes.json();
        return res.json({ success: true, sent: targetTokens.length, result });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── 8. HEALTH CHECK ──────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));

app.listen(PORT, () => {
    console.log(`\n✅ OmniDrive backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   M-Pesa API  : ${MPESA_BASE}`);
    console.log(`   Callback URL: ${MPESA_CALLBACK_URL}`);
    console.log(`   Database    : omnidrive.db\n`);
});
