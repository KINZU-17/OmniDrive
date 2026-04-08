require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE,
    MPESA_PASSKEY,
    MPESA_CALLBACK_URL,
    PORT = 3000
} = process.env;

// In-memory store for payment statuses (use a DB in production)
const paymentStore = {};

// ─── 1. GET ACCESS TOKEN ───────────────────────────────────────────────────
async function getAccessToken() {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const res = await fetch(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } }
    );
    if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

// ─── 2. STK PUSH ──────────────────────────────────────────────────────────
app.post('/api/mpesa/purchase', async (req, res) => {
    const { phone, amount, vehicleName, vehicleId } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ success: false, error: 'phone and amount are required' });
    }

    // Safaricom sandbox only accepts amounts ≤ 1 in test mode
    // For real production, use the actual amount
    const stkAmount = process.env.NODE_ENV === 'production' ? Math.ceil(amount) : 1;

    try {
        const token = await getAccessToken();

        const timestamp = new Date()
            .toISOString()
            .replace(/[-T:.Z]/g, '')
            .slice(0, 14);

        const password = Buffer.from(
            `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
        ).toString('base64');

        const body = {
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
        };

        const stkRes = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        const stkData = await stkRes.json();

        if (stkData.ResponseCode !== '0') {
            return res.status(400).json({ success: false, error: stkData.ResponseDescription });
        }

        // Store pending status
        paymentStore[stkData.CheckoutRequestID] = { status: 'pending' };

        return res.json({
            success: true,
            checkoutRequestId: stkData.CheckoutRequestID,
            merchantRequestId: stkData.MerchantRequestID
        });

    } catch (err) {
        console.error('[STK Push error]', new Date().toISOString(), err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── 3. MPESA CALLBACK (Safaricom posts here after PIN entry) ─────────────
app.post('/api/mpesa/callback', (req, res) => {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (ResultCode === 0) {
        const items = CallbackMetadata?.Item || [];
        const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
        const amount  = items.find(i => i.Name === 'Amount')?.Value || 0;
        paymentStore[CheckoutRequestID] = { status: 'paid', receipt, amount };
    } else {
        paymentStore[CheckoutRequestID] = { status: 'failed' };
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ─── 4. POLL STATUS (frontend polls this every 3 seconds) ─────────────────
app.get('/api/mpesa/status/:checkoutRequestId', (req, res) => {
    const record = paymentStore[req.params.checkoutRequestId];
    if (!record) return res.json({ status: 'pending' });
    return res.json(record);
});

// ─── 5. HEALTH CHECK ──────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));
app.get('/api/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));

app.listen(PORT, () => {
    console.log(`✅ OmniDrive backend running on http://localhost:${PORT}`);
    console.log(`   Callback URL: ${MPESA_CALLBACK_URL}`);
});
