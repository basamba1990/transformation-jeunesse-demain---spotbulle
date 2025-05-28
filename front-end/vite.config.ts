import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Fonction pour s'assurer que index.html est dans le dossier public
const ensurePublicDir = () => {
  const publicDir = path.resolve(__dirname, 'public');
  const indexSource = path.resolve(__dirname, 'index.html');
  const indexDest = path.resolve(publicDir, 'index.html');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  if (fs.existsSync(indexSource) && !fs.existsSync(indexDest)) {
    fs.copyFileSync(indexSource, indexDest);
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'ensure-public-dir',
      buildStart() {
        ensurePublicDir();
      }
    },
    react()
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
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
