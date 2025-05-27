module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quincenalia-bg': '#eeebe3',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
} 