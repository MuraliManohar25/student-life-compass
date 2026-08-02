/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ORS_API_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly MODE?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
