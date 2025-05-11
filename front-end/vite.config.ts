import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration pour le développement local + Render
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  define: {
    'process.env': {}, // Évite des erreurs lors du build
  },
});
