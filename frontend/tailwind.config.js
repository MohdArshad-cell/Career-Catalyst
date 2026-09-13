/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          400: '#2dd4bf',
          500: '#14b8a6',
        }
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        }
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
      }
    },
  },
  plugins: [],
}
