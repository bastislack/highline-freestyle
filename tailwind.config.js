/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7689F1',
        'secondary': '#FFD46A',
        'dark-gray': '#4B4D5B',
        'light-gray': {
          DEFAULT: '#E6E9F8',
          250: '#F8F8FD',
        },
        'white': '#FFFFFF',
      },
    },
  },
  plugins: [],
  darkMode: "class"
}