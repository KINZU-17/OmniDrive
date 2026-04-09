require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));   // serve index.html & assets

// ─── DATABASE SETUP ────────────────────────────────────────────────────────
const db = new Database('omnidrive.db');

db.exec(`
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
app.post('/api/mpesa/purchase', async (req, res) => {
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
    if (key !== (process.env.ADMIN_KEY || 'omnidrive-admin-2024')) {
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

// ─── 5. HEALTH CHECK ──────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));

app.listen(PORT, () => {
    console.log(`\n✅ OmniDrive backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   M-Pesa API  : ${MPESA_BASE}`);
    console.log(`   Callback URL: ${MPESA_CALLBACK_URL}`);
    console.log(`   Database    : omnidrive.db\n`);
});
