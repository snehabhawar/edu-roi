/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand:   '#6366f1',
        good:    '#10b981',
        warn:    '#f59e0b',
        danger:  '#ef4444',
      },
    },
  },
  plugins: [],
}
