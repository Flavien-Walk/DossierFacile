/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4A6CF7',
          700: '#3B55D4',
          800: '#2E42A8',
          900: '#1E2A78',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        'card-md': '0 4px 20px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.05)',
        'card-lg': '0 8px 32px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.06)',
        'btn':     '0 1px 4px rgba(74,108,247,0.30)',
        'btn-hover': '0 3px 12px rgba(74,108,247,0.38)',
      },
    },
  },
  plugins: [],
};
