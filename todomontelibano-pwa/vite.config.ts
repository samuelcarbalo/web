import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Plugin de Tailwind v4
  ],
  server: {
    port: 3000,
    host: true,
  },
});