import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Doit correspondre exactement à applicationId dans android/app/build.gradle
  appId: 'com.karim.islamhub',
  appName: 'Ahl-Sunnah',
  webDir: 'dist',

  // Configuration Android
  android: {
    // Couleur de la barre de status
    backgroundColor: '#0b1e22', // teal nuit (charte Ahl-Sunnah)
    // Permettre le contenu mixte (HTTP/HTTPS)
    allowMixedContent: true,
  },

  // Configuration du serveur
  server: {
    // Utiliser la navigation native pour une meilleure performance
    androidScheme: 'https',
    // Nettoyer le cache au démarrage (dev uniquement)
    cleartext: false,
  },

  // Plugins
  plugins: {
    // Configuration du Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0b1e22',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#ffffff',
    },
    // Configuration du clavier
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
