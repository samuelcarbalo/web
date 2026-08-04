# Arquitectura SEO — CAPISJ DIGITAL (React PWA + Django REST)

Guía de producción para indexación en Google cuando el frontend es **Vite + React (CSR/PWA)** y el backend es **Django REST Framework**.

---

## 1. Estrategia de renderizado

### Comparativa rápida

| Criterio | **SSG / Prerender (Vite actual)** | **SSR (Next.js App Router)** |
|---|---|---|
| Hosting Hostinger estático | ✅ Ideal (solo `dist/`) | Requiere Node.js o Vercel |
| Páginas listado (empleos, eventos) | ⚠️ Meta vía JS (Helmet) | ✅ HTML completo en primera respuesta |
| Detalle `/empleos/:id` dinámico | ⚠️ Depende de Googlebot ejecutando JS | ✅ `generateMetadata` + fetch en servidor |
| PWA + Service Worker | ✅ Nativo con `vite-plugin-pwa` | ✅ Con configuración cuidadosa |
| Costo infra | Mínimo | Medio |
| Tiempo de migración | Bajo (ya implementado) | Alto |

### Recomendación según dinámica de datos

| Tipo de contenido | Actualización | Estrategia |
|---|---|---|
| Home, listados principales | Diaria | **Prerender estático** en build (`/`, `/empleos`, …) |
| Detalle empleo/evento/inmueble | Por publicación | **Fase 1:** `SeoEntityPage` + JSON-LD (actual). **Fase 2:** prerender rutas top N en build o migrar detalle a Next.js |
| Dashboard, login, créditos | Privado | `noindex` (ya configurado) |

**Para Hostinger hoy:** mantén Vite + añade **prerender de rutas estáticas** y **`VITE_SITE_URL` correcto**. Si el SEO de detalle sigue flojo en 4–8 semanas, migra solo las rutas públicas de detalle a **Next.js** como frontend SEO y deja el panel autenticado en la PWA actual.

---

## 2. Integración Django ↔ React

### Flujo de datos para SEO

```
Googlebot → HTML (index.html + meta estáticos)
         → JS bundle → React Query → GET /api/v1/jobs/:id/
         → react-helmet-async actualiza <title>, OG, JSON-LD
```

### Backend (opcional, sin romper API actual)

Endpoint de metadatos ligeros (futuro):

```python
# GET /api/v1/seo/jobs/<uuid>/
{
  "title": "Desarrollador React",
  "description": "Vacante en Montería...",
  "canonical_path": "/empleos/uuid",
  "og_image": "https://...",
  "json_ld": { "@type": "JobPosting", ... }
}
```

Usar en **build time** (script Node que genera HTML por ID) o en **Next.js `generateMetadata`**.

### Caché y revalidación

| Capa | Header / herramienta | Uso |
|---|---|---|
| Listados públicos DRF | `Cache-Control: public, max-age=300, stale-while-revalidate=600` | Empleos/eventos |
| Detalle | `max-age=60` | Cambios frecuentes |
| Build estático | Regenerar sitemap en CI cada deploy | `npm run prebuild` |
| CDN Hostinger | Invalidar cache al subir `dist/` | Tras cada release |

---

## 3. Frontend TypeScript (implementado)

### Componentes clave

- `src/config/brand.ts` — nombre visible **CAPISJ DIGITAL** (sin tocar backend)
- `src/config/seo.ts` — títulos, rutas, sitemap
- `src/components/SEO/SeoHead.tsx` — meta + OG + Twitter
- `src/components/SEO/SeoEntityPage.tsx` — detalle con fallbacks en loading/error
- `src/components/SEO/RouteSeo.tsx` — SEO por ruta en layout

### Ejemplo detalle (patrón)

```tsx
<SeoEntityPage
  title={job.title}
  description={job.description.slice(0, 160)}
  path={`/empleos/${job.id}`}
  isLoading={isLoading}
  isError={!job}
  jsonLd={buildJobPostingSchema(job)}
/>
```

### Evitar páginas en blanco para crawlers

1. `index.html` incluye `<noscript>` con enlaces a secciones principales.
2. `SeoEntityPage` emite meta **fallback** mientras carga.
3. Rutas privadas con `noindex`.

---

## 4. PWA y SEO

### Service Worker (`vite.config.ts`)

- HTML con estrategia **NetworkFirst** (no servir SPA obsoleta a bots).
- `navigateFallbackDenylist` para `/api/`.

### Banner de instalación

- `PwaInstallBanner` en **MainLayout** — esquina inferior derecha, botón **Instalar** y **X**.
- Preferencia en `localStorage`: `pwa-install-banner-dismissed`.

---

## 5. Checklist Hostinger (acción inmediata)

1. En `.env` de producción: `VITE_SITE_URL=https://tu-dominio-real.com`
2. `npm run build` → sube **todo** `dist/` (incluye `sitemap.xml`, `robots.txt`)
3. Verifica en Search Console:
   - Propiedad del dominio
   - Sitemap: `https://tu-dominio.com/sitemap.xml`
4. Comprueba que `robots.txt` apunte al **mismo dominio** (antes apuntaba a `cordobatech.com` — corregido).
5. Lighthouse → SEO ≥ 90 en home y listados.

---

## 6. Roadmap recomendado

| Fase | Acción | Impacto SEO |
|---|---|---|
| **A (hecho)** | Marca CAPISJ, robots/sitemap, SeoEntityPage, noscript | Medio |
| **B** | Prerender `/`, `/empleos`, `/eventos` en build (vite-plugin-prerender) | Alto |
| **C** | Sitemap dinámico con IDs desde DRF en CI | Alto |
| **D** | Next.js solo para rutas públicas de detalle | Muy alto |

---

*Documento vivo — actualizar al cambiar dominio o estrategia de deploy.*
