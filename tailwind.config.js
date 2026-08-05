/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b9d1ff',
          300: '#8fb4ff',
          400: '#5f8dff',
          500: '#3a66f5',
          600: '#2a4bd6',
          700: '#2239ab',
          800: '#1f3187',
          900: '#1d2c6b'
        }
      }
    }
  },
  plugins: []
}
