/**
 * sync-site.js — copy the built single-file web app from web/dist into the
 * project ROOT, so opening the root with a plain static server (VS Code Live
 * Server, `python -m http.server`, etc.) shows the whole app at `index.html`.
 *
 * The app falls back to bundled demo inventory when no /api backend is present,
 * so it renders fully standalone. For the full experience (login, real listings,
 * payments) run the backend with `npm start` and use http://localhost:3000.
 *
 * Run via:  npm run build:site
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'web', 'dist');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('No build found at web/dist. Run the web build first.');
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.copyFileSync(src, dest);
  }
}

const copied = [];
for (const entry of fs.readdirSync(DIST)) {
  copyRecursive(path.join(DIST, entry), path.join(ROOT, entry));
  copied.push(entry);
}

console.log('Synced web build to project root: ' + copied.join(', '));
console.log('Open the root with Live Server (or any static server) to view the app.');
