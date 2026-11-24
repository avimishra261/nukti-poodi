/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kesariya: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          900: '#7C2D12',
        },
        mandir: {
          cream: '#FFFBEB',
          gold: '#F59E0B',
          maroon: '#7C2D12',
          dark: '#431407',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'var(--font-devanagari)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
