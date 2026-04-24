require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { stkPush, stkQuery } = require('./daraja');

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'https://kinzu-17.github.io', 'https://omnidrive.co.ke'],
    methods: ['GET', 'POST']
}));

// In-memory store for pending transactions (use a DB in production)
const pendingTransactions = {};
const approvedListings = [];

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'OmniDrive Backend Running', version: '1.0.0' });
});

// ─── STK Push — Listing Fee ───────────────────────────────────────────────────
// POST /api/mpesa/listing-fee
// Body: { phone, amount, dealerName, listingId }
app.post('/api/mpesa/listing-fee', async (req, res) => {
    const { phone, amount, dealerName, listingId } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ error: 'phone and amount are required' });
    }

    try {
        const result = await stkPush({
            phone,
            amount,
            reference: `LISTING-${listingId || Date.now()}`,
            description: `OmniDrive Listing Fee - ${dealerName || 'Dealer'}`
        });

        // Store pending transaction
        pendingTransactions[result.CheckoutRequestID] = {
            listingId,
            dealerName,
            phone,
            amount,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            checkoutRequestId: result.CheckoutRequestID,
            merchantRequestId: result.MerchantRequestID,
            message: result.CustomerMessage
        });
    } catch (err) {
        console.error('STK Push error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'STK Push failed',
            details: err.response?.data || err.message
        });
    }
});

// ─── STK Push — Vehicle Purchase ─────────────────────────────────────────────
// POST /api/mpesa/purchase
// Body: { phone, amount, vehicleName, vehicleId }
app.post('/api/mpesa/purchase', async (req, res) => {
    const { phone, amount, vehicleName, vehicleId } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ error: 'phone and amount are required' });
    }

    try {
        const result = await stkPush({
            phone,
            amount,
            reference: `VEHICLE-${vehicleId || Date.now()}`,
            description: `OmniDrive - ${vehicleName || 'Vehicle Purchase'}`
        });

        pendingTransactions[result.CheckoutRequestID] = {
            vehicleId,
            vehicleName,
            phone,
            amount,
            type: 'purchase',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            checkoutRequestId: result.CheckoutRequestID,
            merchantRequestId: result.MerchantRequestID,
            message: result.CustomerMessage
        });
    } catch (err) {
        console.error('STK Push error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'STK Push failed',
            details: err.response?.data || err.message
        });
    }
});

// ─── Safaricom Callback ───────────────────────────────────────────────────────
// POST /api/mpesa/callback
// Called automatically by Safaricom after PIN entry
app.post('/api/mpesa/callback', (req, res) => {
    const body = req.body?.Body?.stkCallback;

    if (!body) {
        return res.status(400).json({ error: 'Invalid callback' });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body;

    console.log(`\n📱 MPesa Callback Received`);
    console.log(`   CheckoutRequestID: ${CheckoutRequestID}`);
    console.log(`   ResultCode: ${ResultCode} — ${ResultDesc}`);

    const txn = pendingTransactions[CheckoutRequestID];

    if (ResultCode === 0) {
        // Payment successful
        const meta = {};
        CallbackMetadata?.Item?.forEach(item => {
            meta[item.Name] = item.Value;
        });

        console.log(`   ✅ Payment confirmed!`);
        console.log(`   Amount: KES ${meta.Amount}`);
        console.log(`   Receipt: ${meta.MpesaReceiptNumber}`);
        console.log(`   Phone: ${meta.PhoneNumber}`);

        if (txn) {
            txn.status = 'paid';
            txn.receipt = meta.MpesaReceiptNumber;
            txn.paidAt = new Date().toISOString();
            txn.amountPaid = meta.Amount;

            // Auto-approve listing if it was a listing fee payment
            if (txn.listingId) {
                approvedListings.push({
                    listingId: txn.listingId,
                    receipt: meta.MpesaReceiptNumber,
                    approvedAt: new Date().toISOString()
                });
                console.log(`   🚗 Listing ${txn.listingId} auto-approved`);
            }
        }
    } else {
        // Payment failed or cancelled
        console.log(`   ❌ Payment failed: ${ResultDesc}`);
        if (txn) txn.status = 'failed';
    }

    // Always respond 200 to Safaricom
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ─── Query Transaction Status ─────────────────────────────────────────────────
// GET /api/mpesa/status/:checkoutRequestId
app.get('/api/mpesa/status/:checkoutRequestId', async (req, res) => {
    const { checkoutRequestId } = req.params;

    // Check local store first
    const txn = pendingTransactions[checkoutRequestId];
    if (txn?.status === 'paid') {
        return res.json({ status: 'paid', receipt: txn.receipt, amount: txn.amountPaid });
    }
    if (txn?.status === 'failed') {
        return res.json({ status: 'failed' });
    }

    // Query Daraja directly
    try {
        const result = await stkQuery(checkoutRequestId);
        const paid = result.ResultCode === '0';
        if (paid && txn) txn.status = 'paid';
        res.json({
            status: paid ? 'paid' : 'pending',
            resultCode: result.ResultCode,
            resultDesc: result.ResultDesc
        });
    } catch (err) {
        res.json({ status: 'pending' });
    }
});

// ─── Get Approved Listings ────────────────────────────────────────────────────
// GET /api/listings/approved
app.get('/api/listings/approved', (req, res) => {
    res.json(approvedListings);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚗 OmniDrive Backend running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/`);
    console.log(`   STK Push (listing): POST http://localhost:${PORT}/api/mpesa/listing-fee`);
    console.log(`   STK Push (purchase): POST http://localhost:${PORT}/api/mpesa/purchase`);
    console.log(`   Callback: POST http://localhost:${PORT}/api/mpesa/callback`);
    console.log(`   Status: GET http://localhost:${PORT}/api/mpesa/status/:id\n`);
});
