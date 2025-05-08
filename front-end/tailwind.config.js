/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          light: '#6D28D9', // Un violet plus clair pour les accents
          DEFAULT: '#5B21B6', // Violet principal (similaire à indigo-700 ou purple-700)
          dark: '#4C1D95',  // Un violet plus foncé pour les états hover/focus
        },
        'secondary': {
          light: '#3B82F6', // Bleu clair (similaire à blue-500)
          DEFAULT: '#2563EB', // Bleu principal (similaire à blue-600)
          dark: '#1D4ED8',   // Bleu foncé (similaire à blue-700)
        },
        'accent': {
          DEFAULT: '#EC4899', // Rose (similaire à pink-500)
          hover: '#DB2777',   // Rose plus foncé
        },
        'neutral': {
          lightest: '#F9FAFB', // Gris très clair (similaire à gray-50)
          light: '#F3F4F6',    // Gris clair (similaire à gray-100)
          DEFAULT: '#6B7280',   // Gris moyen (similaire à gray-500)
          dark: '#374151',     // Gris foncé (similaire à gray-700)
          darkest: '#111827',  // Gris très foncé (similaire à gray-900)
        },
        'success': '#10B981', // Vert (similaire à green-500)
        'warning': '#F59E0B', // Ambre/Jaune (similaire à amber-500)
        'danger': '#EF4444',  // Rouge (similaire à red-500)
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        // Ajoutez d'autres familles de polices si nécessaire (ex: serif, mono)
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin pour améliorer les styles de base des formulaires
    require('@tailwindcss/typography'), // Plugin pour des styles de typographie par défaut (prose)
    require('@tailwindcss/line-clamp'), // Plugin pour limiter le nombre de lignes de texte
  ],
}

