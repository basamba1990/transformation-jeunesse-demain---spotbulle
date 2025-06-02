import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

// Composant App simplifié sans providers
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-blue-600 mb-4">SpotBulle - Test de rendu</h1>
              <p className="text-lg mb-4">Si vous voyez ce message, le rendu React fonctionne correctement.</p>
            </div>
          </MainLayout>
        } />
        <Route path="*" element={
          <MainLayout>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-blue-600 mb-4">SpotBulle - Page non trouvée</h1>
              <p className="text-lg mb-4">La page demandée n'existe pas.</p>
            </div>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
