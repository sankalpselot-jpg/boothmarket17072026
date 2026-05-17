// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Treat all .js files as JSX-capable.
      // Our source files use .js extension but contain JSX syntax.
      include: ['**/*.js', '**/*.jsx'],
    }),
  ],

  server: {
    port: 3000,
    open: false,
  },

  build: {
    outDir: 'build',
    sourcemap: false,
    // Remove manualChunks — can cause "Could not resolve module" errors on Vercel
    // Vite handles code splitting automatically without this
  },
});
