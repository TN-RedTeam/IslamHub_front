// Applique la classe `dark` sur <html> avant le premier rendu React
// pour éviter le flash blanc au chargement en mode sombre.
(function () {
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    // localStorage indisponible (navigation privée stricte) : thème clair par défaut
  }
})();
