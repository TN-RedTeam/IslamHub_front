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
        // ── Nuit Teal (Phase 8) — pilotés par variables CSS (clair/sombre) ──
        bg1: 'var(--bg1)', bg2: 'var(--bg2)',
        accent: { DEFAULT: 'var(--acc)', br: 'var(--acc2)', deep: 'var(--accdeep)' },
        glass: { DEFAULT: 'var(--glass)', border: 'var(--glass-b)', tint: 'var(--glass2)' },
        ok: 'var(--ok)', warn: 'var(--warn)', low: 'var(--low)',
        dome: { DEFAULT: 'var(--dome)', deep: 'var(--dome2)' },

        // ── Alias historiques (remappés sur Nuit Teal via index.css) ──
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

        // ---- Anciennes couleurs conservées le temps du balayage (à retirer ensuite) ----
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
      },
      borderRadius: { card: '18px', panel: '20px', glass: '20px' },
      boxShadow: {
        card: '0 1px 2px rgba(4,18,18,.04), 0 12px 28px -20px rgba(4,18,18,.45)',
        'card-hover': '0 2px 8px rgba(4,18,18,.06), 0 22px 44px -22px rgba(4,18,18,.55)',
        glass: '0 8px 30px -12px rgba(4,18,18,.35)',
        fab: '0 10px 22px rgba(15,138,128,.45)',
      },
    },
  },
  plugins: [],
};
