/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}', // nếu bạn dùng pages/
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
  
}
