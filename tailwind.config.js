/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        forge: {
          bg:      '#FAFAF9',
          surface: '#FFFFFF',
          border:  '#E5E0DA',
          text:    '#111111',
          muted:   '#9A928A',
          ink:     '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
