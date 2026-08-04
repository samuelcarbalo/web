/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_TENANT_SLUG: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_IMGBB_API_KEY?: string;
  readonly VITE_MERCADOPAGO_PUBLIC_KEY?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
