// backup.js — snapshot the OmniDrive DB before any update:  npm run backup
// Uses SQLite's `VACUUM INTO` for a consistent, single-file copy (WAL-safe).
'use strict';
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_FILE = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'omnidrive.db'));
if (!fs.existsSync(DB_FILE)) {
  console.error('No DB found at ' + DB_FILE);
  process.exit(1);
}

const dir = path.join(path.dirname(DB_FILE), 'backups');
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, `omnidrive-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);

const db = new DatabaseSync(DB_FILE);
db.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
db.close();

console.log(`Backup written: ${out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
