/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette Floot - Noir et blanc avec accents
        primary: {
          DEFAULT: '#000000',
          hover: '#171717',
        },
        bg: {
          primary: '#ffffff',
          secondary: '#fafafa',
          tertiary: '#f5f5f5',
        },
        text: {
          primary: '#0a0a0a',
          secondary: '#525252',
          tertiary: '#737373',
        },
        border: {
          DEFAULT: '#e5e5e5',
          hover: '#d4d4d4',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
}
