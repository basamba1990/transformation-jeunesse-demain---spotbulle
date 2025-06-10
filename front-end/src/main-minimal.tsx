import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Version minimale pour tester le chargement React
const MinimalApp = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      <h1 style={{ color: '#3b82f6', marginBottom: '20px', fontSize: '2.5rem' }}>
        🎯 SpotBulle
      </h1>
      <p style={{ 
        marginBottom: '20px', 
        textAlign: 'center', 
        maxWidth: '500px',
        fontSize: '1.1rem',
        color: '#64748b'
      }}>
        Application en cours de chargement...
      </p>
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#10b981',
        color: 'white',
        borderRadius: '8px',
        fontSize: '1rem'
      }}>
        ✅ React fonctionne correctement !
      </div>
    </div>
  );
};

// Point d'entrée sécurisé
const main = () => {
  try {
    console.log('🚀 Initialisation SpotBulle...');
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error("Élément racine 'root' non trouvé");
    }
    
    console.log('📦 Création du root React...');
    const root = createRoot(container);
    
    console.log('🎨 Rendu de l\'application...');
    root.render(
      <React.StrictMode>
        <MinimalApp />
      </React.StrictMode>
    );
    
    console.log('✅ SpotBulle chargé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement de SpotBulle:', error);
    
    // Fallback en cas d'erreur
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          font-family: Arial, sans-serif;
          background-color: #fef2f2;
          color: #dc2626;
          padding: 20px;
        ">
          <h1 style="margin-bottom: 20px; font-size: 2rem;">⚠️ Erreur SpotBulle</h1>
          <p style="margin-bottom: 20px; text-align: center; max-width: 500px;">
            Une erreur s'est produite lors du chargement de l'application.
          </p>
          <pre style="
            background: #fee2e2; 
            padding: 15px; 
            border-radius: 8px; 
            overflow: auto;
            max-width: 90%;
            font-size: 0.9rem;
          ">${error.message}</pre>
          <button onclick="window.location.reload()" style="
            margin-top: 20px;
            background-color: #dc2626; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            cursor: pointer;
            font-size: 1rem;
          ">
            🔄 Rafraîchir la page
          </button>
        </div>
      `;
    }
  }
};

// Exécuter au chargement
main();

