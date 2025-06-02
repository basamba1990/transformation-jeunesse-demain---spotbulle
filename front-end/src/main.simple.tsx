import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Composant App minimal pour tester le rendu React
const App = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">SpotBulle - Test de rendu minimal</h1>
      <p className="text-lg mb-4">
        Si vous voyez ce message, le rendu React fonctionne correctement.
      </p>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
