import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';

// Composant App avec ThemeProvider et AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <MainLayout>
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold text-blue-600 mb-4">SpotBulle - Test avec tous les providers</h1>
                  <p className="text-lg mb-4">Si vous voyez ce message, le rendu React avec tous les providers fonctionne correctement.</p>
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
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
