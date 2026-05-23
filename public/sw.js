const CACHE = 'omnidrive-v6';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/favicon.svg',
    '/logo.svg',
    '/privacy.html',
    '/terms.html',
    '/dealer-register.html'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── Push Notifications ───────────────────────────────────────────────────
self.addEventListener('push', e => {
    const data = e.data?.json() || {};
    const title = data.title || 'OmniDrive';
    const options = {
        body: data.body || 'You have a new message',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        image: data.image || null,
        tag: data.tag || 'omnidrive-msg',
        renotify: true,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'view', title: '👁 View', icon: '/favicon.svg' },
            { action: 'dismiss', title: '✕ Dismiss' }
        ],
        data: { url: data.url || '/', chatId: data.chatId || null }
    };
    e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.action === 'dismiss') return;
    const url = e.notification.data?.url || '/';
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const client of list) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.postMessage({ type: 'NOTIFICATION_CLICK', url, chatId: e.notification.data?.chatId });
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});

// ── Background Sync (chat messages sent offline) ─────────────────────────
self.addEventListener('sync', e => {
    if (e.tag === 'sync-messages') {
        e.waitUntil(syncPendingMessages());
    }
});

async function syncPendingMessages() {
    // Notify all clients to flush pending messages
    const list = await clients.matchAll({ type: 'window' });
    list.forEach(c => c.postMessage({ type: 'SYNC_MESSAGES' }));
}

// ── Message from page ────────────────────────────────────────────────────
self.addEventListener('message', e => {
    if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
    if (e.data?.type === 'BROADCAST') {
        // Relay chat messages to all open tabs
        clients.matchAll({ type: 'window' }).then(list => {
            list.forEach(c => { if (c !== e.source) c.postMessage(e.data); });
        });
    }
});

// ── Fetch ────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Only handle requests from this SW's scope
    if (!e.request.url.startsWith(self.registration.scope)) return;

    if (url.hostname.includes('open.er-api.com')) {
        e.respondWith(
            fetch(e.request)
                .then(res => { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); return res; })
                .catch(() => caches.match(e.request))
        );
        return;
    }
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (!res || res.status !== 200 || res.type === 'opaque') return res;
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return res;
            });
        })
    );
});
