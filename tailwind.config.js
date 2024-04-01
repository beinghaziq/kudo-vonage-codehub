/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      colors: {
        TextBlue: '#075985',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
