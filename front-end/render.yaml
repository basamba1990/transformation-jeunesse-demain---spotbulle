import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration pour le déploiement Render
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    'process.env': {}, // Évite des erreurs lors du build
  },
});
