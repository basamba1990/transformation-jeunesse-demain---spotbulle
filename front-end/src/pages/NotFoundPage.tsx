import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Page non trouvée</h1>
      <p className="text-lg mb-6">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Que faire maintenant ?</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Vérifiez l'URL pour vous assurer qu'elle est correcte</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Retournez à la <a href="/" className="text-blue-600 hover:underline">page d'accueil</a></span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Consultez nos <a href="/resources" className="text-blue-600 hover:underline">ressources</a> disponibles</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotFoundPage;
