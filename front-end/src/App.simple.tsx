import React from 'react';

const SimpleApp = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">SpotBulle</h1>
      <p className="text-lg mb-6">
        Bienvenue sur la plateforme SpotBulle, votre espace de partage audio et de connexion.
      </p>
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Version simplifiée</h2>
        <p>
          Cette version simplifiée fonctionne correctement. Nous procédons à la réintégration 
          progressive des fonctionnalités complètes.
        </p>
        <div className="text-sm text-amber-500 mt-2">
          Audio temporairement indisponible
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
