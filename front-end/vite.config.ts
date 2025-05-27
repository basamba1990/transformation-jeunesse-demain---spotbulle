import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // Ajout explicite de la base URL pour éviter les problèmes de chemins en production
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    }
  },
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
    // Amélioration de la gestion des erreurs et des avertissements
    reportCompressedSize: false, // Améliore la vitesse de build
    sourcemap: true, // Ajoute des sourcemaps pour faciliter le débogage
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          // Séparation des dépendances pour améliorer le caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Autres chunks si nécessaire
        }
      }
    }
  },
  // Optimisation pour la production
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
});
