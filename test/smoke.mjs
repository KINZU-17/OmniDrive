/**
 * smoke.mjs — boots the real server against a throwaway DB and verifies the
 * security-critical behaviour of the merged build:
 *   - public browse works
 *   - login issues a JWT
 *   - protected writes reject anonymous (401) and wrong-role (403) callers
 *   - an admin JWT can write
 *   - dealer tenancy scoping: a dealer cannot edit another dealer's listing (404)
 *   - self-registration cannot mint an admin
 *
 * Run: npm test
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = 4123;
const BASE = `http://127.0.0.1:${PORT}`;
const DB_PATH = path.join(__dirname, 'smoke.db');

// fresh DB each run
for (const f of [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm']) {
  try { fs.unlinkSync(f); } catch {}
}

let passed = 0, failed = 0;
const ok = (name) => { passed++; console.log(`  [ok]   ${name}`); };
const bad = (name, detail) => { failed++; console.error(`  [FAIL] ${name}${detail ? ' - ' + detail : ''}`); };
function expect(cond, name, detail) { cond ? ok(name) : bad(name, detail); }

const child = spawn('node', ['server.js'], {
  cwd: ROOT,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: String(PORT),
    DB_PATH,
    JWT_SECRET: 'smoke_test_secret_value_please_ignore_0123456789',
    REDIS_HOST: '127.0.0.1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
child.stdout.on('data', (d) => { serverLog += d; });
child.stderr.on('data', (d) => { serverLog += d; });

// First-run boot seeds demo data with bcrypt (12 rounds) which can take tens of
// seconds on a loaded/slow machine, so give the server a generous window.
async function waitForHealth(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return true;
    } catch {}
    await new Promise((res) => setTimeout(res, 250));
  }
  return false;
}

const api = (path, { method = 'GET', token, body } = {}) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

// Every response is normalized to { success, data, timestamp, pagination?, error? }
function unwrap(j) { return j ? j.data : undefined; }

async function main() {
  if (!(await waitForHealth())) {
    console.error('Server did not become healthy. Logs:\n' + serverLog);
    throw new Error('boot failed');
  }
  console.log('Server is up. Running checks...\n');

  // 1. public browse
  let r = await api('/api/listings');
  let list = unwrap(await r.json());
  expect(r.status === 200 && Array.isArray(list) && list.length >= 1, 'public browse returns seeded listings',
    `status=${r.status}`);
  const sample = (list || [])[0] || {};
  expect(Number.isInteger(sample.price), 'listing price is an integer (no float drift)', `price=${sample.price}`);

  // 2. login as seeded admin -> JWT
  r = await api('/api/auth/login', { method: 'POST', body: { email: 'admin@omnidrive.co.ke', password: 'Admin@123' } });
  let j = unwrap(await r.json());
  const adminToken = j.token;
  expect(r.status === 200 && typeof adminToken === 'string' && adminToken.split('.').length === 3,
    'admin login issues a JWT', `status=${r.status}`);

  // 3. anonymous write rejected
  r = await api('/api/listings', { method: 'POST', body: { brand: 'X', model: 'Y', price: 1, nation: 'Japan' } });
  expect(r.status === 401, 'anonymous create listing -> 401', `status=${r.status}`);

  // 4. wrong-role (client) rejected
  r = await api('/api/auth/login', { method: 'POST', body: { email: 'customer@example.com', password: 'Client@123' } });
  const clientToken = unwrap(await r.json()).token;
  r = await api('/api/listings', { method: 'POST', token: clientToken, body: { brand: 'X', model: 'Y', price: 1, nation: 'Japan' } });
  expect(r.status === 403, 'client create listing -> 403', `status=${r.status}`);

  // 5. admin can write
  r = await api('/api/listings', { method: 'POST', token: adminToken, body: { brand: 'Mazda', model: 'Demio', price: 999999, nation: 'Japan' } });
  const createEnv = await r.json();
  expect((r.status === 200 || r.status === 201) && createEnv.success === true, 'admin create listing -> success', `status=${r.status}`);

  // 6. self-registration cannot mint an admin (role downgraded to client)
  const email = `t${Date.now()}@example.com`;
  r = await api('/api/auth/register', { method: 'POST', body: { name: 'Tester', email, password: 'secret123', role: 'admin' } });
  j = unwrap(await r.json());
  expect(r.status === 201 && j.user && j.user.role === 'client', 'register cannot self-assign admin role',
    `role=${j.user && j.user.role}`);
  // and /me echoes the verified identity
  r = await api('/api/auth/me', { token: j.token });
  const me = unwrap(await r.json());
  expect(r.status === 200 && me.user.email === email, '/api/auth/me resolves token identity', `status=${r.status}`);

  // 7. dealer tenancy scoping: toyota dealer cannot edit a nissan listing
  r = await api('/api/auth/login', { method: 'POST', body: { email: 'dealer@toyota.co.ke', password: 'Dealer@123' } });
  const toyotaToken = unwrap(await r.json()).token;
  // find a nissan listing id
  const all = (unwrap(await (await api('/api/listings?limit=100')).json())) || [];
  const nissan = all.find((l) => l.dealer_email === 'dealer@nissan.co.ke');
  if (!nissan) console.error('    [debug] listings:', all.map((l) => `${l.id}:${l.brand}/${l.dealer_email}`).join(', '));
  if (nissan) {
    r = await api(`/api/dealer/listings/${nissan.id}`, {
      method: 'PUT', token: toyotaToken,
      body: { brand: 'HACK', model: 'X', price: 1, nation: 'Japan' },
    });
    expect(r.status === 404, 'dealer cannot edit another dealer listing -> 404 (tenancy)', `status=${r.status}`);
  } else {
    bad('locate a nissan listing for tenancy test', 'none found');
  }

  // 8. OTP login (dev returns devCode since no SMS provider configured)
  r = await api('/api/auth/otp/request', { method: 'POST', body: { identifier: 'admin@omnidrive.co.ke' } });
  let otp = unwrap(await r.json());
  expect(r.status === 200 && typeof otp.devCode === 'string' && otp.devCode.length === 6,
    'otp request returns a dev code', `status=${r.status}`);

  r = await api('/api/auth/otp/verify', { method: 'POST', body: { identifier: 'admin@omnidrive.co.ke', code: otp.devCode } });
  otp = unwrap(await r.json());
  expect(r.status === 200 && typeof otp.token === 'string' && otp.user.role === 'admin',
    'otp verify issues a JWT for the admin', `status=${r.status}`);

  // OTP by phone (trailing-digits match) + wrong code rejected
  r = await api('/api/auth/otp/request', { method: 'POST', body: { identifier: '0700000001' } });
  const phoneCode = unwrap(await r.json()).devCode;
  r = await api('/api/auth/otp/verify', { method: 'POST', body: { identifier: '0700000001', code: '000000' } });
  expect(r.status === 401, 'otp verify rejects a wrong code', `status=${r.status}`);
  r = await api('/api/auth/otp/verify', { method: 'POST', body: { identifier: '0700000001', code: phoneCode } });
  expect(r.status === 200 && typeof unwrap(await r.json()).token === 'string',
    'otp login by phone number works', `status=${r.status}`);

  // 9. reviews: public read shape, anonymous write rejected, and the
  // verified-purchaser gate blocks a client with no paid order.
  r = await api(`/api/listings/${sample.id}/reviews`);
  const rev = unwrap(await r.json());
  expect(r.status === 200 && rev && Array.isArray(rev.reviews) && typeof rev.count === 'number',
    'public reviews return a summary shape', `status=${r.status}`);

  r = await api(`/api/listings/${sample.id}/reviews`, { method: 'POST', body: { rating: 5 } });
  expect(r.status === 401, 'anonymous post review -> 401', `status=${r.status}`);

  r = await api(`/api/listings/${sample.id}/reviews`, { method: 'POST', token: clientToken, body: { rating: 5, comment: 'nope' } });
  expect(r.status === 403, 'non-purchaser post review -> 403 (verified buyers only)', `status=${r.status}`);

  console.log(`\n${passed} passed, ${failed} failed`);
}

main()
  .catch((e) => { console.error(e); failed++; })
  .finally(() => {
    child.kill('SIGKILL');
    for (const f of [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm']) { try { fs.unlinkSync(f); } catch {} }
    process.exit(failed === 0 ? 0 : 1);
  });
