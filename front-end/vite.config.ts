import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Utiliser des chemins relatifs pour éviter les problèmes de déploiement
  build: {
    outDir: 'dist',
    sourcemap: false, // Désactiver les sourcemaps en production
    rollupOptions: {
      output: {
        // Éviter les problèmes de noms de fichiers avec hachage
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
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
    strictPort: true,
    host: true
  }
});
