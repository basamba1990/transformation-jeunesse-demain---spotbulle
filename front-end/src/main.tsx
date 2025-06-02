import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Point d'entrée principal
const main = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("Élément racine 'root' non trouvé");
    return;
  }
  
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Rendu React avec tous les composants réussi");
  } catch (error) {
    console.error("Erreur lors du rendu React:", error);
    container.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="color: #e53e3e;">Erreur de rendu React</h1>
        <p>Une erreur s'est produite lors du chargement de l'application.</p>
        <pre style="background: #f7fafc; padding: 10px; border-radius: 4px; overflow: auto;">${error}</pre>
      </div>
    `;
  }
};

// Exécuter le point d'entrée
main();
