import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Utiliser des chemins relatifs pour éviter les problèmes de déploiement
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
    // Désactiver la minification pour le débogage
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        // Éviter les problèmes de noms de fichiers avec hachage
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  // Optimisation pour la production
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  },
  // Éviter les erreurs de transpilation
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
