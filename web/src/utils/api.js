const BASE_URL = (() => {
  if (typeof window === 'undefined') return '';
  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:3000';
  return `${protocol}//${hostname}`;
})();

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, CNY: 7.24,
  CHF: 0.88, SEK: 10.42, NOK: 10.68, DKK: 6.87, PLN: 3.98,
  CAD: 1.36, AUD: 1.53, MXN: 17.15, BRL: 4.97,
  INR: 83.12, KRW: 1335.00, SGD: 1.34, HKD: 7.82, MYR: 4.72,
  THB: 36.25, IDR: 15650.00, PHP: 55.80, AED: 3.67, SAR: 3.75,
  TRY: 32.15, EGP: 30.90, KWD: 0.31, QAR: 3.64,
  ZAR: 18.65, NGN: 1550.00, KES: 157.50, GHS: 12.35, MAD: 9.95,
  NZD: 1.64,
};

export const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CHF: 'Fr',
  CAD: 'C$', AUD: 'A$', KES: 'KSh', NGN: '₦', ZAR: 'R',
  INR: '₹', KRW: '₩', MYR: 'RM', AED: 'AED', SAR: 'SAR',
};
