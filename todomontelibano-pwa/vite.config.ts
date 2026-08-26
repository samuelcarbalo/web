import { defineConfig, loadEnv, type UserConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';

function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return;

  // Lucide: chunk aparte; cada ruta ya importa iconos por nombre (tree-shake).
  if (id.includes('lucide-react')) return 'vendor-icons';

  if (id.includes('react-router')) return 'vendor-router';

  if (
    id.includes('node_modules/react-dom') ||
    id.includes('node_modules\\react-dom') ||
    id.includes('node_modules/scheduler') ||
    id.includes('node_modules\\scheduler')
  ) {
    return 'vendor-react-dom';
  }

  if (
    id.includes('node_modules/react/') ||
    id.includes('node_modules\\react\\') ||
    id.includes('node_modules/react-helmet-async') ||
    id.includes('node_modules\\react-helmet-async')
  ) {
    return 'vendor-react';
  }

  if (id.includes('@tanstack')) return 'vendor-query';
  if (id.includes('axios')) return 'vendor-http';
  if (id.includes('@mercadopago')) return 'vendor-mercadopago';
  if (id.includes('workbox-window') || id.includes('virtual:pwa-register')) {
    return 'vendor-pwa';
  }
  if (id.includes('zustand') || id.includes('clsx') || id.includes('tailwind-merge')) {
    return 'vendor-utils';
  }

  return 'vendor';
}

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL || 'https://chever.co';

  const plugins: PluginOption[] = [
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
        'fonts/*.woff2',
      ],
      manifest: {
        id: `${siteUrl.replace(/\/$/, '')}/`,
        name: 'Chéver',
        short_name: 'Chéver',
        description:
          'Empleos, deportes, bienes raíces y eventos publicitarios en Córdoba. Plataforma multi-servicios Chéver.',
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
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/google[^/]+\.html$/,
          /^\/llms\.txt$/,
          /^\/robots\.txt$/,
        ],
        runtimeCaching: [
          {
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
  ];

  return {
    base: '/',
    plugins,
    server: {
      port: 3000,
      host: true,
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      modulePreload: {
        // Evita preload agresivo de todos los chunks lazy en el HTML inicial
        resolveDependencies: (_filename, deps) =>
          deps.filter(
            (d) =>
              d.includes('vendor-react') ||
              d.includes('vendor-react-dom') ||
              d.includes('vendor-router') ||
              d.includes('vendor-query') ||
              d.includes('vendor-http') ||
              d.includes('vendor-utils') ||
              /\/index-/.test(d),
          ),
      },
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  };
});
