/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Latin -> Inter ; Arabe -> Amiri (placé AVANT system-ui pour que
        // l'arabe des textes mixtes FR/AR utilise Amiri, pas la police système).
        sans: ['Inter', 'Amiri', '"Noto Naskh Arabic"', 'system-ui', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
        arabic: ['"Noto Naskh Arabic"', 'serif'],
      },
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      backgroundImage: {
        'arabesque': "url('https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=2487&auto=format&fit=crop')",
      },
    },
  },
  plugins: [],
};
