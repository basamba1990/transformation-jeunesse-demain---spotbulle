/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Ajoute ici d'autres variables d'environnement VITE_ si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
