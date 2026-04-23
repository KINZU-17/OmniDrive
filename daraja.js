const axios = require('axios');

const DARAJA_BASE = 'https://sandbox.safaricom.co.ke';

// ─── Get OAuth Access Token ───────────────────────────────────────────────────
async function getAccessToken() {
    const auth = Buffer.from(
        `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
    ).toString('base64');

    const res = await axios.get(
        `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` } }
    );
    return res.data.access_token;
}

// ─── Generate Password ────────────────────────────────────────────────────────
function getPassword(timestamp) {
    const raw = `${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`;
    return Buffer.from(raw).toString('base64');
}

// ─── Get Timestamp ────────────────────────────────────────────────────────────
function getTimestamp() {
    return new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
}

// ─── Initiate STK Push ────────────────────────────────────────────────────────
async function stkPush({ phone, amount, reference, description }) {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);

    // Normalize phone: 0712... → 254712...
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0')) normalized = '254' + normalized.slice(1);
    if (normalized.startsWith('+')) normalized = normalized.slice(1);

    const payload = {
        BusinessShortCode: process.env.SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: normalized,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: normalized,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: reference || 'OmniDrive',
        TransactionDesc: description || 'OmniDrive Payment'
    };

    const res = await axios.post(
        `${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
}

// ─── Query STK Push Status ────────────────────────────────────────────────────
async function stkQuery(checkoutRequestId) {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);

    const res = await axios.post(
        `${DARAJA_BASE}/mpesa/stkpushquery/v1/query`,
        {
            BusinessShortCode: process.env.SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
}

module.exports = { stkPush, stkQuery, getAccessToken };
