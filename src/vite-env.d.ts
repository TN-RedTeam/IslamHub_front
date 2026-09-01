/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Constantes injectées au build par Vite (voir `define` dans vite.config.ts).
declare const __APP_VERSION__: string;
declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;
