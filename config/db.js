/**
 * db.js — OmniDrive database on Node's built-in node:sqlite (Node >= 22.5).
 *
 * Merged design:
 *  - Engine: node:sqlite (real file-backed SQLite, WAL + transactions). No native
 *    build step and no full-file rewrites — replaces the fragile better-sqlite3
 *    (native) / sql.js (whole-file rewrite) approaches from earlier builds.
 *  - Schema evolves via additive MIGRATIONS tracked by PRAGMA user_version, so
 *    updates never drop or reformat existing rows.
 *  - Security: passwords are bcrypt hashes (`password_hash`); roles are
 *    constrained; first-run provisioning seeds demo data in dev only and a single
 *    super-admin (env or generated password) in production.
 *  - Money: stored as INTEGER units (whole KES) — no floating-point drift.
 *
 * Exports a better-sqlite3-shaped handle (`db.prepare().run/get/all`, `db.exec`)
 * so existing route code keeps working, plus a `tx()` transaction helper.
 */
'use strict';

const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const DB_FILE = process.env.DB_PATH || path.join(__dirname, '..', 'omnidrive.db');
const IS_PROD = process.env.NODE_ENV === 'production';

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 5000');

/** Run a function inside a transaction; rolls back on error. */
function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

// ── MIGRATIONS: additive only. Append new ones; never edit/drop old. ──────────
const MIGRATIONS = [
  // v1 — full initial schema (merges the original feature schema with the
  // security/tenancy fields from the 1.2 rewrite).
  () => db.exec(`
    CREATE TABLE IF NOT EXISTS dealerships (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      owner_email TEXT,
      status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Platform users (auth). Passwords are bcrypt hashes; roles are constrained.
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'client'
                    CHECK (role IN ('admin','dealer','liaison','client')),
      phone         TEXT DEFAULT '',
      dealership_id INTEGER,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dealership_id) REFERENCES dealerships(id) ON DELETE SET NULL
    );

    -- Active vehicle listings (publicly visible). Price is whole-KES INTEGER.
    CREATE TABLE IF NOT EXISTS listings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      brand         TEXT NOT NULL,
      model         TEXT NOT NULL,
      price         INTEGER NOT NULL CHECK (price >= 0),
      nation        TEXT NOT NULL,
      category      TEXT DEFAULT 'Car',
      condition     TEXT DEFAULT 'Used',
      body_style    TEXT,
      fuel_type     TEXT,
      drivetrain    TEXT,
      color         TEXT,
      city          TEXT DEFAULT 'Nairobi',
      image         TEXT,
      badges        TEXT DEFAULT '[]',
      specs         TEXT DEFAULT '{}',
      rating        REAL DEFAULT 4.5,
      reviewCount   INTEGER DEFAULT 0,
      dealer_email  TEXT DEFAULT '',
      dealership_id INTEGER,
      createdAt     TEXT DEFAULT (datetime('now')),
      isActive      INTEGER DEFAULT 1
    );

    -- Orders / transactions. Amount is whole-KES INTEGER.
    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      checkout_id    TEXT UNIQUE,
      merchant_id    TEXT,
      phone          TEXT,
      amount         INTEGER DEFAULT 0,
      vehicle_id     TEXT,
      vehicle_name   TEXT,
      status         TEXT DEFAULT 'pending',
      receipt        TEXT,
      customer_email TEXT,
      dealer_email   TEXT DEFAULT '',
      liaison_email  TEXT DEFAULT '',
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now'))
    );

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
      price       INTEGER,
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

    -- Chat system
    CREATE TABLE IF NOT EXISTS chat_users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      role       TEXT DEFAULT 'client',
      avatar     TEXT DEFAULT '',
      status     TEXT DEFAULT 'offline',
      lastSeen   TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT DEFAULT '',
      isPublic    INTEGER DEFAULT 1,
      createdBy   TEXT DEFAULT '',
      type        TEXT DEFAULT 'group',
      createdAt   TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_room_members (
      room_id  INTEGER,
      user_id  TEXT,
      joinedAt TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (room_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id   INTEGER NOT NULL,
      senderId  TEXT NOT NULL,
      content   TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_reads (
      message_id INTEGER,
      user_id    TEXT,
      PRIMARY KEY (message_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS chat_presence (
      user_id  TEXT PRIMARY KEY,
      lastSeen TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id  INTEGER,
      endpoint TEXT UNIQUE,
      p256dh   TEXT,
      auth     TEXT
    );
    CREATE TABLE IF NOT EXISTS msg_read_receipts (
      msg_id  INTEGER,
      user_id INTEGER,
      read_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (msg_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS push_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      token      TEXT UNIQUE,
      user_email TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes (kept in-sync with real column names)
    CREATE INDEX IF NOT EXISTS idx_listings_brand     ON listings(brand);
    CREATE INDEX IF NOT EXISTS idx_listings_category  ON listings(category);
    CREATE INDEX IF NOT EXISTS idx_listings_nation    ON listings(nation);
    CREATE INDEX IF NOT EXISTS idx_listings_active    ON listings(isActive, createdAt);
    CREATE INDEX IF NOT EXISTS idx_listings_dealer    ON listings(dealer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_checkout    ON orders(checkout_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_customer    ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_pending_status     ON pending_listings(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_dealers_status     ON dealer_applications(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_chat_msg_room      ON chat_messages(room_id);
    CREATE INDEX IF NOT EXISTS idx_chat_msg_sender    ON chat_messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_users_dealership   ON users(dealership_id);
  `),

  // v2 — one-time login codes (OTP). Codes are stored hashed, with an expiry.
  () => db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier  TEXT NOT NULL,                 -- phone/email the user typed
      user_id     INTEGER,
      code_hash   TEXT NOT NULL,
      purpose     TEXT NOT NULL DEFAULT 'login',
      expires_at  TEXT NOT NULL,
      consumed    INTEGER NOT NULL DEFAULT 0,
      attempts    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_otp_identifier ON otp_codes(identifier, consumed);
  `),
];

function migrate() {
  const start = db.prepare('PRAGMA user_version').get().user_version;
  for (let v = start; v < MIGRATIONS.length; v++) {
    tx(() => { MIGRATIONS[v](); db.exec(`PRAGMA user_version = ${v + 1}`); });
    console.log(`DB schema migrated to v${v + 1}.`);
  }
}
migrate();

// ── First-run provisioning ───────────────────────────────────────────────────
const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
if (userCount === 0) {
  if (IS_PROD) {
    // Production: a single platform admin only. No demo data.
    const generated = !process.env.ADMIN_PASSWORD;
    const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
    const email = (process.env.ADMIN_EMAIL || 'owner@omnidrive.co.ke').toLowerCase();
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run('Platform Owner', email, bcrypt.hashSync(pw, 12), 'admin');
    if (generated) {
      console.log('============================================================');
      console.log(' Created admin with a GENERATED password:');
      console.log('     email:    ' + email);
      console.log('     password: ' + pw);
      console.log(' SAVE THIS NOW. It will not be shown again.');
      console.log('============================================================');
    } else {
      console.log('Created platform admin from ADMIN_PASSWORD.');
    }
  } else {
    // Development: full demo so the app is usable immediately.
    console.log('Seeding demo data (development, first run)...');
    tx(() => {
      const insD = db.prepare('INSERT INTO dealerships (slug, name, owner_email) VALUES (?, ?, ?)');
      const toyota = Number(insD.run('toyota-ke', 'Toyota Kenya', 'dealer@toyota.co.ke').lastInsertRowid);
      const nissan = Number(insD.run('nissan-prem', 'Nissan Premium', 'dealer@nissan.co.ke').lastInsertRowid);

      const h = (p) => bcrypt.hashSync(p, 12);
      const insU = db.prepare('INSERT INTO users (name,email,password_hash,role,phone,dealership_id) VALUES (?,?,?,?,?,?)');
      insU.run('Platform Admin', 'admin@omnidrive.co.ke', h('Admin@123'),  'admin',   '+254700000001', null);
      insU.run('Toyota Dealer',  'dealer@toyota.co.ke',   h('Dealer@123'), 'dealer',  '+254711000001', toyota);
      insU.run('Nissan Dealer',  'dealer@nissan.co.ke',   h('Dealer@123'), 'dealer',  '+254722000001', nissan);
      insU.run('Lead Liaison',   'liaison@omnidrive.co.ke', h('Liaison@123'), 'liaison', '+254733000001', null);
      insU.run('A Customer',     'customer@example.com',  h('Client@123'), 'client',  '+254700000000', null);

      const insL = db.prepare(`INSERT INTO listings
        (brand,model,price,nation,category,condition,body_style,fuel_type,drivetrain,color,city,image,specs,rating,dealer_email,dealership_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
      insL.run('Toyota','Corolla',2500000,'Japan','Car','Used','Sedan','Petrol','FWD','Silver','Nairobi',
        'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=640',
        JSON.stringify({ engine: '1.8L', transmission: 'CVT' }), 4.6, 'dealer@toyota.co.ke', toyota);
      insL.run('Toyota','RAV4',4200000,'Japan','Car','Used','SUV','Petrol','AWD','White','Nairobi',
        'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=640',
        JSON.stringify({ engine: '2.0L', transmission: 'Auto' }), 4.7, 'dealer@toyota.co.ke', toyota);
      insL.run('Nissan','Note',1550000,'Japan','Car','Used','Hatchback','Petrol','FWD','Blue','Mombasa',
        'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=640',
        JSON.stringify({ engine: '1.2L', transmission: 'CVT' }), 4.4, 'dealer@nissan.co.ke', nissan);
      insL.run('Nissan','X-Trail',5000000,'Japan','Car','Used','SUV','Petrol','AWD','Black','Nairobi',
        'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=640',
        JSON.stringify({ engine: '2.5L', transmission: 'CVT' }), 4.8, 'dealer@nissan.co.ke', nissan);
    });
    console.log('Seed complete. Demo logins: admin@omnidrive.co.ke / Admin@123 (+ dealer@toyota.co.ke / Dealer@123, customer@example.com / Client@123)');
  }
}

module.exports = { db, tx };
