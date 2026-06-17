/** @type {import('tailwindcss').Config} */
const path = require('path');
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    'min-h-screen', 'bg-gradient-to-br', 'from-slate-50', 'to-slate-100',
    'container', 'mx-auto', 'px-4', 'py-8', 'text-center',
    'bg-purple-600', 'hover:bg-purple-700', 'text-white',
    'rounded-lg', 'shadow-lg', 'p-6', 'flex', 'items-center',
  ],
  plugins: [],
}
