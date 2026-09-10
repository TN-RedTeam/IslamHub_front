/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Phase 11.1 — charte définitive : titres FR = EB Garamond, corps/UI = Newsreader,
        // arabe = Scheherazade New, Bismillah home = Amiri (arabic-display).
        display: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['Newsreader', 'Georgia', 'serif'],
        // Système de polices arabes par usage (Phase 13.4)
        arabic: ['"Scheherazade New"', 'serif'],          // lecture : hadiths, versets, invocations, paroles
        'arabic-display': ['Amiri', 'serif'],             // grande Bismillah de la home uniquement
        'arabic-name': ['"Noto Naskh Arabic"', 'serif'],  // NOMS & UI : écoles, savants, honorifiques
        'arabic-quran': ['"Amiri Quran"', 'serif'],       // les 99 Noms d'Allah uniquement
      },
      colors: {
        // ---- Tokens de charte (Phase 11.1) : pilotés par variables CSS (clair/sombre) ----
        ground: 'var(--ground)',
        surface: 'var(--surface)',
        ivory: 'var(--ivory)', // alias historique de --surface (bg-ivory)
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        green: { DEFAULT: 'var(--green)', deep: 'var(--green-deep)', soft: 'var(--green-soft)', line: 'var(--green-line)' },
        gold: { DEFAULT: 'var(--gold)', soft: 'var(--gold-soft)' },
        // Accents par rubrique (désaturés, identiques clair/sombre)
        ecole: { hanafi: '#b0782e', maliki: '#1f6f66', shafii: '#3c5390', hanbali: '#875073' },

        // ---- Anciennes couleurs conservées le temps du balayage 10.3 (à retirer ensuite) ----
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
      },
      borderRadius: { card: '14px', panel: '18px' },
      boxShadow: {
        card: '0 1px 2px rgba(27,36,30,.03), 0 10px 24px -18px rgba(27,36,30,.20)',
        'card-hover': '0 2px 6px rgba(27,36,30,.05), 0 18px 36px -20px rgba(27,36,30,.32)',
      },
      backgroundImage: {
        // conservé le temps du balayage 10.3 (les héros colorés seront retirés)
        arabesque: "url('https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=2487&auto=format&fit=crop')",
      },
    },
  },
  plugins: [],
};
