/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          300: '#a3e635', // lime-400 fallback
          400: '#84cc16', // lime-500 fallback
          500: '#65a30d', // vibrant eco-green
          600: '#4d7c0f',
        },
        cyan: {
          300: '#2dd4bf', // teal-400
          400: '#14b8a6', // teal-500
          500: '#0d9488', // deep circuit-teal
          600: '#0f766e',
        },
        eco: {
          dark: '#0f172a',
          light: '#f8fafc',
          green: '#84cc16',
          blue: '#0d9488',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Syncopate', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
