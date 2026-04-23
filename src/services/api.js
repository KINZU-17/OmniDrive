const BACKEND_URL = __DEV__
    ? 'http://localhost:3000'
    : 'https://api.omnidrive.co.ke';

export const api = {
    async getHealth() {
        const res = await fetch(`${BACKEND_URL}/health`);
        return res.json();
    },

    async initiateMpesa({ phone, amount, vehicleName, vehicleId, email }) {
        const res = await fetch(`${BACKEND_URL}/api/mpesa/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, amount, vehicleName, vehicleId, email })
        });
        return res.json();
    },

    async pollMpesaStatus(checkoutRequestId) {
        const res = await fetch(`${BACKEND_URL}/api/mpesa/status/${checkoutRequestId}`);
        return res.json();
    },

    async submitListing(listing) {
        const res = await fetch(`${BACKEND_URL}/api/listings/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listing)
        });
        return res.json();
    },

    async registerDealer(data) {
        const res = await fetch(`${BACKEND_URL}/api/dealer/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async registerPushToken(token, email = '') {
        const res = await fetch(`${BACKEND_URL}/api/push/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email })
        });
        return res.json();
    }
};
