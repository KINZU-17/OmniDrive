import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    // Pre-transform: run JSX in .js files through esbuild before Vite's
    // import analysis (oxc in v6) sees them. Keeps .js extension as-is.
    {
      name: 'jsx-in-js-files',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.includes('node_modules') && id.endsWith('.js')) {
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        }
      },
    },
    react({ include: /\.(jsx?|tsx?)$/ }),
    tailwindcss(),

    // Installable PWA + offline support.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: "OmniDrive — Kenya's Vehicle Marketplace",
        short_name: 'OmniDrive',
        description: "Browse and purchase vehicles via MPesa. Kenya's vehicle marketplace.",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#e47911',
        background_color: '#0d1117',
        categories: ['shopping', 'automotive'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Browse Cars', short_name: 'Cars', url: '/browse?category=Car' },
          { name: 'My Wishlist', short_name: 'Wishlist', url: '/wishlist' },
        ],
      },
      workbox: {
        // SPA fallback: any navigation that isn't a precached asset returns the
        // app shell, so deep links / refreshes work online AND offline (and the
        // server never has to expose a directory listing).
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//, /^\/assets\//],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Vehicle listings — fresh when online, last copy when offline.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/listings'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-listings',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),

    // Inline all JS + CSS into a single self-contained index.html, so the whole
    // app ships in one file (no separate /assets/* bundle to 404 or list).
    viteSingleFile(),
  ],
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3001,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
