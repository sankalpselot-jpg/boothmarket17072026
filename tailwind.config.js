// tailwind.config.js
// Written as ESM (export default) to match Vite's module system.
// CommonJS (module.exports) causes build warnings with Vite.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f3',
          100: '#ffe0e4',
          200: '#ffc6cd',
          300: '#ff9aa6',
          400: '#ff5f73',
          500: '#f83049',
          600: '#e51435',
          700: '#c10d2b',
          800: '#a10f29',
          900: '#881229',
          950: '#4c0210',
        },
        dark: {
          900: '#0f0f1a',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#0f3460',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
