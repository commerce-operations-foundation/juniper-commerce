/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f1f8',
          100: '#e0e2f0',
          500: '#3d4a8a',
          700: '#1e2d6b',
          900: '#1a1a2e',
        },
        teal: {
          400: '#2ec4a9',
          500: '#16a085',
          600: '#0e8a72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
