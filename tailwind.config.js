/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c0c0d',
        asphalt: '#17171a',
        concrete: '#8d8f94',
        bone: '#f2f1ee',
        red: '#c4161c',
      },
      fontFamily: {
        display: ['Marcellus', 'Georgia', 'serif'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
