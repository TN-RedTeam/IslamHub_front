// Version de l'application, injectée au build (voir `define` dans vite.config.ts).
export const APP_VERSION = __APP_VERSION__;
export const BUILD_SHA = __BUILD_SHA__;
export const BUILD_TIME = __BUILD_TIME__;

// Libellé affiché discrètement dans l'app, ex. « MàJ 01/09/2026 · 1a2b3c4 ».
// La date + le hash du commit changent à chaque déploiement.
export const VERSION_LABEL = (() => {
  let date = '';
  try {
    date = new Date(BUILD_TIME).toLocaleDateString('fr-FR');
  } catch {
    /* date de build illisible : on garde juste le hash */
  }
  return date ? `MàJ ${date} · ${BUILD_SHA}` : `Build ${BUILD_SHA}`;
})();
