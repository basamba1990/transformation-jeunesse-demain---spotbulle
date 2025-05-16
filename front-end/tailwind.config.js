/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#F3EEFF',
          100: '#E4D9FF',
          200: '#C9B3FF',
          300: '#AD8DFF',
          400: '#9166FF',
          500: '#7540FF', // Couleur principale
          light: '#6D28D9', // Un violet plus clair pour les accents (compatibilité)
          DEFAULT: '#5B21B6', // Violet principal (compatibilité)
          dark: '#4C1D95',  // Un violet plus foncé (compatibilité)
          700: '#4C1D95',
          800: '#3E1A75',
          900: '#2F1755',
        },
        'secondary': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          light: '#3B82F6', // Bleu clair (compatibilité)
          DEFAULT: '#2563EB', // Bleu principal (compatibilité)
          dark: '#1D4ED8',   // Bleu foncé (compatibilité)
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        'accent': {
          50: '#FCE7F3',
          100: '#FBCFE8',
          200: '#F9A8D4',
          300: '#F472B6',
          400: '#EC4899', // Actuelle
          DEFAULT: '#EC4899', // Rose (compatibilité)
          hover: '#DB2777',   // Rose plus foncé (compatibilité)
          500: '#DB2777',
          600: '#BE185D',
          700: '#9D174D',
          800: '#831843',
          900: '#500724',
        },
        'neutral': {
          lightest: '#F9FAFB', // Gris très clair (compatibilité)
          light: '#F3F4F6',    // Gris clair (compatibilité)
          DEFAULT: '#6B7280',   // Gris moyen (compatibilité)
          dark: '#374151',     // Gris foncé (compatibilité)
          darkest: '#111827',  // Gris très foncé (compatibilité)
        },
        'success': '#10B981', // Vert (similaire à green-500)
        'warning': '#F59E0B', // Ambre/Jaune (similaire à amber-500)
        'danger': '#EF4444',  // Rouge (similaire à red-500)
        'earth': {
          100: '#F5F0E6', // Beige clair
          200: '#E6DFD1', // Beige
          300: '#D7CFC0', // Beige foncé
          400: '#A89F8C', // Taupe
        },
        'nature': {
          100: '#E7F3EF', // Vert d'eau très clair
          200: '#C2E0D3', // Vert sauge clair
          300: '#9ECDB8', // Vert sauge
          400: '#7AB99D', // Vert sauge foncé
        },
        'dark': {
          'bg': '#121212',
          'surface': '#1E1E1E',
          'border': '#2A2A2A',
          'text': '#E0E0E0',
          'muted': '#A0A0A0',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'], // Pour les titres principaux
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        'handwritten': ['Caveat', 'cursive'], // Pour les accents artisanaux
        'mono': ['JetBrains Mono', 'monospace'], // Pour les éléments techniques
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      // Animations personnalisées
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin pour améliorer les styles de base des formulaires
    require('@tailwindcss/typography'), // Plugin pour des styles de typographie par défaut (prose)
    require('@tailwindcss/line-clamp'), // Plugin pour limiter le nombre de lignes de texte
  ],
}
