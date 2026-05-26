import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CordobaTech',
        short_name: 'CordobaTech',
        description: 'CordobaTech - Tu plataforma multi-servicios para Córdoba.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        icons: [
          { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
});