import { execSync } from 'node:child_process';
import { defineConfig, loadEnv, type UserConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/** Identidad estable de la PWA: no debe cambiar entre deploys ni entornos. */
const PWA_APP_ID = 'chever-pwa-app';

function resolveBuildHash(): string {
  const fromEnv = (
    process.env.VITE_BUILD_HASH ||
    process.env.RENDER_GIT_COMMIT ||
    process.env.GITHUB_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    ''
  ).trim();
  if (fromEnv) return fromEnv.slice(0, 12);

  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return Date.now().toString(36);
  }
}

function injectBuildHash(hash: string): PluginOption {
  return {
    name: 'inject-pwa-build-hash',
    transformIndexHtml(html) {
      return html.replaceAll('__BUILD_HASH__', hash);
    },
  };
}

/** Precarga hojas CSS del build para reducir FOUC en producción. */
function preloadBuiltCss(): PluginOption {
  return {
    name: 'preload-built-css',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;

        const preloads = Object.keys(bundle)
          .filter((file) => file.endsWith('.css'))
          .map((file) => {
            const href = file.startsWith('/') ? file : `/${file}`;
            return `<link rel="preload" href="${href}" as="style" crossorigin />`;
          });

        if (!preloads.length) return html;
        return html.replace('</head>', `${preloads.join('\n    ')}\n  </head>`);
      },
    },
  };
}

function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    if (id.includes('/src/pages/Admin/')) return 'page-admin';
    if (id.includes('/src/pages/Sports/')) return 'page-sports';
    if (id.includes('/src/pages/Shop/')) return 'page-shop';
    return;
  }

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
  const buildHash = resolveBuildHash();
  process.env.VITE_BUILD_HASH = buildHash;

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    preloadBuiltCss(),
    injectBuildHash(buildHash),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      // Registro manual en src/lib/pwa.ts (evita doble registro)
      injectRegister: false,
      includeAssets: [
        'critical.css',
        'chever-logo.svg',
        'chever_oficial.svg',
        'chever-oficial-pwa.svg',
        'icon-192x192.png',
        'icon-512x512.png',
        'robots.txt',
        'sitemap.xml',
        'fonts/*.woff2',
      ],
      manifest: {
        id: PWA_APP_ID,
        name: 'Chéver',
        short_name: 'Chéver',
        description:
          'Empleos, deportes, bienes raíces y eventos publicitarios en Córdoba. Plataforma multi-servicios Chéver.',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        lang: 'es',
        dir: 'ltr',
        scope: '/',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['business', 'productivity', 'lifestyle'],
        related_applications: [
          {
            platform: 'webapp',
            url: `${siteUrl.replace(/\/$/, '')}/manifest.webmanifest`,
            id: PWA_APP_ID,
          },
        ],
        prefer_related_applications: false,
        icons: [
          {
            src: '/chever-oficial-pwa.svg?v=1.3',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          { src: '/icon-192x192.png?v=1.3', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512x512.png?v=1.3', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icon-512x512.png?v=1.3',
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
            icons: [{ src: '/chever-oficial-pwa.svg?v=1.3', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Deportes',
            short_name: 'Deportes',
            description: 'Torneos y ligas locales',
            url: '/deportes',
            icons: [{ src: '/chever-oficial-pwa.svg?v=1.3', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Bienes Raíces',
            short_name: 'Inmuebles',
            description: 'Propiedades en venta y alquiler',
            url: '/bienes-raices',
            icons: [{ src: '/chever-oficial-pwa.svg?v=1.3', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Tienda',
            short_name: 'Tienda',
            description: 'Catálogo y compras locales',
            url: '/tienda',
            icons: [{ src: '/chever-oficial-pwa.svg?v=1.3', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Eventos',
            short_name: 'Eventos',
            description: 'Eventos publicitarios y agenda local',
            url: '/eventos',
            icons: [{ src: '/chever-oficial-pwa.svg?v=1.3', sizes: 'any', type: 'image/svg+xml' }],
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        minify: true,
        rollupFormat: 'iife',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ];

  return {
    base: '/',
    define: {
      'import.meta.env.VITE_BUILD_HASH': JSON.stringify(buildHash),
    },
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
