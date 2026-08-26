import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL || 'https://chever.co';

  return {
    // Rutas anidadas (/dashboard, /tienda/x) deben resolver assets desde la raíz
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Registro manual en src/lib/pwa.ts (evita doble registro)
        injectRegister: false,
        includeAssets: [
          'chever-logo.svg',
          'chever_oficial.svg',
          'chever-oficial-pwa.svg',
          'icon-192x192.png',
          'icon-512x512.png',
          'robots.txt',
        ],
        manifest: {
          // id estable: Chrome reutiliza la misma instalación aunque cambie name/short_name
          id: `${siteUrl.replace(/\/$/, '')}/`,
          name: 'Chever',
          short_name: 'Chever',
          description:
            'Empleos, deportes, bienes raíces y eventos publicitarios en Córdoba. Plataforma multi-servicios Chever.',
          theme_color: '#FFFFFF',
          background_color: '#FFFFFF',
          lang: 'es',
          dir: 'ltr',
          scope: '/',
          start_url: '/?source=pwa',
          display: 'standalone',
          orientation: 'portrait-primary',
          categories: ['business', 'productivity', 'lifestyle'],
          related_applications: [
            {
              platform: 'webapp',
              url: `${siteUrl.replace(/\/$/, '')}/manifest.webmanifest`,
            },
          ],
          prefer_related_applications: false,
          icons: [
            {
              src: '/chever-oficial-pwa.svg?v=1.2',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
            { src: '/icon-192x192.png?v=1.2', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512x512.png?v=1.2', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: '/icon-512x512.png?v=1.2',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Empleos',
              short_name: 'Empleos',
              description: 'Bolsa de trabajo y vacantes',
              url: '/empleos',
              icons: [{ src: '/chever-oficial-pwa.svg?v=1.2', sizes: 'any', type: 'image/svg+xml' }],
            },
            {
              name: 'Deportes',
              short_name: 'Deportes',
              description: 'Torneos y ligas locales',
              url: '/deportes',
              icons: [{ src: '/chever-oficial-pwa.svg?v=1.2', sizes: 'any', type: 'image/svg+xml' }],
            },
            {
              name: 'Bienes Raíces',
              short_name: 'Inmuebles',
              description: 'Propiedades en venta y alquiler',
              url: '/bienes-raices',
              icons: [{ src: '/chever-oficial-pwa.svg?v=1.2', sizes: 'any', type: 'image/svg+xml' }],
            },
            {
              name: 'Tienda',
              short_name: 'Tienda',
              description: 'Catálogo y compras locales',
              url: '/tienda',
              icons: [{ src: '/chever-oficial-pwa.svg?v=1.2', sizes: 'any', type: 'image/svg+xml' }],
            },
            {
              name: 'Eventos',
              short_name: 'Eventos',
              description: 'Eventos publicitarios y agenda local',
              url: '/eventos',
              icons: [{ src: '/chever-oficial-pwa.svg?v=1.2', sizes: 'any', type: 'image/svg+xml' }],
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          importScripts: ['/notification-sw.js'],
          // Precache hashed assets only — no HTML (navegación siempre desde red)
          globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Evita servir index.html / rutas SPA desde Cache Storage
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ url }) =>
                /\.(?:svg|png)$/i.test(url.pathname) && !url.pathname.startsWith('/assets/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'brand-assets',
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
      Sitemap({
        hostname: siteUrl,
        generateRobotsTxt: false,
        dynamicRoutes: [
          '/',
          '/empleos',
          '/deportes',
          '/bienes-raices',
          '/eventos',
          '/tienda',
          '/contact',
          '/privacy',
          '/terms',
        ],
        changefreq: 'daily',
        priority: {
          '*': 0.5,
          '/': 1.0,
          '/empleos': 0.9,
          '/deportes': 0.9,
          '/bienes-raices': 0.9,
          '/eventos': 0.9,
          '/tienda': 0.9,
          '/contact': 0.5,
          '/privacy': 0.3,
          '/terms': 0.3,
        },
      }),
    ],
    server: {
      port: 3000,
      host: true,
    },
  };
});
