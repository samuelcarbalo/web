# CordobaTech PWA — Frontend

Aplicación React (Vite 7 + TypeScript + Tailwind 4) multi-tenant para CordobaTech: empleos, deportes, bienes raíces, mensajería, notificaciones y compra de créditos vía Mercado Pago.

## Stack

- React 19 · Vite 7 · TypeScript
- Tailwind CSS 4 · React Router 7
- TanStack Query · Zustand
- PWA (`vite-plugin-pwa`) · SEO (`react-helmet-async`, `vite-plugin-sitemap`)
- Mercado Pago Checkout Pro (`@mercadopago/sdk-react`)

## Inicio rápido

```bash
cd web/todomontelibano-pwa
npm install
npm run dev          # http://localhost:3000
npm run build        # dist/ + sitemap.xml + manifest PWA
npm run preview
```

## Variables de entorno (`.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_TENANT_SLUG=conectando-empleo
VITE_SITE_URL=https://cordobatech.com
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | Base URL del backend Django |
| `VITE_TENANT_SLUG` | Slug de la organización (header `X-Tenant`) |
| `VITE_SITE_URL` | URL canónica del sitio (SEO, sitemap) |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Public Key sandbox/producción de Mercado Pago |

> El archivo `.env` está en `.gitignore`. No subir credenciales al repositorio.

---

## Rutas principales

### Rutas SEO (español — canónicas)

| Servicio | Ruta |
|----------|------|
| Inicio | `/` |
| Empleos | `/empleos` |
| Deportes | `/deportes` |
| Bienes raíces | `/bienes-raices` |
| Comprar créditos | `/creditos` |
| Resultado de pago | `/creditos/resultado` |

### Redirecciones legacy (inglés → español)

| Antigua | Nueva |
|---------|-------|
| `/jobs/*` | `/empleos/*` |
| `/sports/*` | `/deportes/*` |
| `/real-estate/*` | `/bienes-raices/*` |
| `/trabajos` | `/empleos` |
| `/propiedades` | `/bienes-raices` |

### Otras rutas

- Auth: `/login`, `/register`
- Empleos: `/empleos/:id`, `/empleos/publicar`, `/empleos/mis-ofertas`
- Bienes raíces: `/bienes-raices/:id`, `/bienes-raices/publicar`, `/bienes-raices/mis-publicaciones`
- Deportes: `/deportes/tournaments/:slug`, etc.
- Mensajes: `/messages`, `/messages/:conversationId`
- Dashboard: `/dashboard`, `/profile`, `/applications`

---

## Módulos implementados

### 1. SEO y PWA (Sitelinks)

**Objetivo:** optimizar indexación y favorecer Sitelinks de Google para Empleos, Deportes y Bienes Raíces.

| Archivo / carpeta | Función |
|-------------------|---------|
| `src/config/seo.ts` | URLs canónicas, metadatos por ruta, rutas del sitemap |
| `src/components/SEO/SeoHead.tsx` | Title, description, OG, Twitter Card, canonical |
| `src/components/SEO/RouteSeo.tsx` | Metadatos automáticos por ruta |
| `src/components/SEO/JsonLd.tsx` | Inyector JSON-LD |
| `src/components/SEO/schemas/seoSchemas.ts` | Schema `Organization`, `WebSite`, `JobPosting`, `CollectionPage` |
| `src/routes/legacyRedirects.tsx` | Redirecciones client-side legacy → español |
| `public/robots.txt` | Reglas de rastreo + enlace al sitemap |
| `vite.config.ts` | PWA manifest con **shortcuts** a `/empleos`, `/deportes`, `/bienes-raices`; plugin sitemap con prioridad 0.9 |

**Dependencias:** `react-helmet-async`, `vite-plugin-sitemap`

Al hacer `npm run build` se generan `dist/sitemap.xml` y `dist/manifest.webmanifest`.

---

### 2. Sistema de créditos y Mercado Pago

**Equivalencia:** 1 crédito = $1.000 COP · Empleo/inmueble = 5 créditos · Torneo = 50 créditos.

| Archivo | Función |
|---------|---------|
| `src/config/credits.ts` | Costos, paquetes fallback, formateo COP |
| `src/lib/paymentsApi.ts` | Cliente API pagos y moderación |
| `src/hooks/usePayments.ts` | React Query: paquetes, preferencia MP, reportes |
| `src/pages/Credits/CreditPackagesPage.tsx` | Vista `/creditos` — 4 tarjetas de paquetes |
| `src/pages/Credits/PaymentResultPage.tsx` | Retorno post-checkout |
| `src/components/Credits/CreditBalanceBadge.tsx` | Saldo en header |
| `src/components/Credits/InsufficientCreditsAlert.tsx` | Alerta + enlace a compra |
| `src/components/Credits/MercadoPagoCheckout.tsx` | Wallet SDK (`@mercadopago/sdk-react`) |
| `src/components/Credits/CreditPackageCard.tsx` | Tarjeta de paquete con badges promo |

**Flujo:** usuario elige paquete → `POST /payments/create-preference/` → SDK Wallet con `preference_id` → MP redirige a `/creditos/resultado`.

**Paquetes:**

| ID | Créditos | Precio | Ahorro |
|----|----------|--------|--------|
| `basico` | 20 | $20.000 | — |
| `bronce` | 30 | $28.000 | $2.000 |
| `plata` | 50 | $45.000 | $5.000 |
| `oro` | 100 | $80.000 | $20.000 |

---

### 3. Moderación de contenido

| Archivo | Función |
|---------|---------|
| `src/components/Moderation/ReportPublicationButton.tsx` | Botón + modal (Fraude / Contenido inapropiado / Discriminación) |

Integrado en: `JobDetail`, `ListingDetail`, `TournamentDetail`.

---

### 4. Mensajería en tiempo real

| Archivo | Función |
|---------|---------|
| `src/types/chat.ts` | Tipos de conversación y mensajes |
| `src/lib/chatApi.ts` | API REST de mensajería |
| `src/hooks/useChat.ts` · `useChatSocket.ts` | Hooks + WebSocket |
| `src/components/Chat/*` | ChatList, ChatWindow, MessageBubble, etc. |
| `src/pages/Messages/MessagesPage.tsx` | Rutas `/messages` |

---

### 5. Notificaciones

| Archivo | Función |
|---------|---------|
| `src/types/notification.ts` | Tipos |
| `src/lib/notificationsApi.ts` | API |
| `src/hooks/useNotifications.ts` | Polling + mutaciones |
| `src/components/Notifications/NotificationPanel.tsx` | Panel en navbar |

---

### 6. Bienes raíces

| Archivo | Función |
|---------|---------|
| `src/hooks/useRealEstate.ts` | CRUD propiedades |
| `src/pages/RealEstate/*` | Listado, detalle, crear, editar, mis publicaciones |
| `src/components/RealEstate/ContactOwnerButton.tsx` | Chat con propietario |

---

### 7. Empleos y deportes

- Empleos: `src/pages/Jobs/*`, hooks `useJobs.ts`
- Deportes: `src/pages/Sports/*`, `src/lib/sportsApi.ts`
- Postulaciones: `src/pages/Applications/*`, chat por postulación

---

## Estructura de carpetas relevante

```
src/
├── config/
│   ├── seo.ts              # SEO y rutas canónicas
│   ├── credits.ts          # Paquetes y costos
│   └── tenant.ts           # Slug del tenant
├── components/
│   ├── SEO/                # Metadatos y JSON-LD
│   ├── Credits/            # UI de créditos y MP
│   ├── Moderation/         # Reportes
│   ├── Chat/               # Mensajería
│   ├── Notifications/      # Notificaciones
│   └── Layout/MainLayout.tsx  # Header semántico + saldo créditos
├── pages/
│   ├── Credits/            # /creditos
│   ├── Jobs/               # /empleos
│   ├── RealEstate/         # /bienes-raices
│   ├── Sports/             # /deportes
│   └── Messages/           # /messages
├── hooks/                  # React Query hooks
├── lib/                    # Clientes API (api.ts, paymentsApi.ts, chatApi.ts)
└── routes/
    └── legacyRedirects.tsx
```

---

## Accesibilidad y semántica HTML

- `<header>`, `<nav aria-label="...">`, `<main id="main-content">`, `<footer role="contentinfo">`
- Skip link “Saltar al contenido principal”
- Focus visible en navegación (`focus-visible:ring`)
- Clases en `src/index.css`: `.skip-link`, `.nav-link`, `.nav-link-active`

---

## Dependencias del backend

Las librerías Python viven en el repo backend: `tenant/requirements.txt` (Django, DRF, Channels, Mercado Pago, etc.).

---

```bash
# Build de producción (valida TypeScript + Vite + PWA + sitemap)
npm run build

# Lint
npm run lint
```

Las pruebas de API viven en el backend (`python manage.py test`). Ver `tenant/README.md`.

---

## Notas de desarrollo

- **Mercado Pago local:** el checkout sandbox funciona; el webhook requiere URL HTTPS (usar [ngrok](https://ngrok.com/) apuntando a `/api/v1/payments/webhook/`).
- **Créditos en UI:** si la API de paquetes falla, se muestra el catálogo local (`FALLBACK_PACKAGES`) para que las tarjetas no desaparezcan.
- **API backend:** las rutas REST siguen en inglés (`/jobs/`, `/real-estate/`, `/sports/`). Solo las URLs del frontend usan español para SEO.
