// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://woic-bln.github.io',
  base: process.env.BASE_PATH ?? '/website',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de',
          en: 'en',
        },
      },
    }),
  ],
  output: 'static',
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'rsvp-mock',
        enforce: 'pre',
        configureServer(server) {
          const counts = /** @type {Record<string, number>} */ ({});
          server.middlewares.use((req, res, next) => {
            if (!req.url?.replace(/\?.*/, '').endsWith('/api/rsvp.php')) return next();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
            const url = new URL(req.url, 'http://localhost');
            if (req.method === 'GET') {
              const id = url.searchParams.get('event') ?? '';
              res.end(JSON.stringify({ count: counts[id] ?? 0 }));
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', c => (body += c));
              req.on('end', () => {
                const { event, decrement } = JSON.parse(body || '{}');
                if (decrement) {
                  counts[event] = Math.max((counts[event] ?? 0) - 1, 0);
                } else {
                  counts[event] = (counts[event] ?? 0) + 1;
                }
                res.end(JSON.stringify({ count: counts[event] }));
              });
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
          });
        },
      },
    ]
  }
});