import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL || 'https://cordobatech.com';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon-192x192.png', 'icon-512x512.png', 'robots.txt'],
        manifest: {
          id: '/',
          name: 'CordobaTech',
          short_name: 'CordobaTech',
          description:
            'Empleos, deportes, bienes raíces y eventos publicitarios en Córdoba. Tu plataforma multi-servicios.',
          theme_color: '#7c3aed',
          background_color: '#fafafa',
          lang: 'es',
          dir: 'ltr',
          scope: '/',
          start_url: '/?source=pwa',
          display: 'standalone',
          orientation: 'portrait-primary',
          categories: ['business', 'productivity', 'lifestyle'],
          icons: [
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: '/icon-512x512.png',
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
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Deportes',
              short_name: 'Deportes',
              description: 'Torneos y ligas locales',
              url: '/deportes',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Bienes Raíces',
              short_name: 'Inmuebles',
              description: 'Propiedades en venta y alquiler',
              url: '/bienes-raices',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Eventos',
              short_name: 'Eventos',
              description: 'Eventos publicitarios y agenda local',
              url: '/eventos',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
        },
      }),
      Sitemap({
        hostname: siteUrl,
        generateRobotsTxt: false,
        dynamicRoutes: ['/', '/empleos', '/deportes', '/bienes-raices', '/eventos', '/contact', '/privacy', '/terms'],
        changefreq: 'daily',
        priority: {
          '*': 0.5,
          '/': 1.0,
          '/empleos': 0.9,
          '/deportes': 0.9,
          '/bienes-raices': 0.9,
          '/eventos': 0.9,
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
