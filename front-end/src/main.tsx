import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PodsPage from './pages/PodsPage';
import MatchesPage from './pages/MatchesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Application SpotBulle complète mais sécurisée
const SpotBulleApp = () => {
  try {
    return (
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              } />
              <Route path="/login" element={
                <MainLayout>
                  <LoginPage />
                </MainLayout>
              } />
              <Route path="/register" element={
                <MainLayout>
                  <RegisterPage />
                </MainLayout>
              } />
              <Route path="/profile" element={
                <MainLayout>
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/pods" element={
                <MainLayout>
                  <ProtectedRoute>
                    <PodsPage />
                  </ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/matches" element={
                <MainLayout>
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                </MainLayout>
              } />
              <Route path="*" element={
                <MainLayout>
                  <NotFoundPage />
                </MainLayout>
              } />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('❌ Erreur dans SpotBulleApp:', error);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '20px'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '2rem' }}>⚠️ Erreur SpotBulle</h1>
        <p style={{ marginBottom: '20px', textAlign: 'center', maxWidth: '500px' }}>
          Une erreur s'est produite dans l'application.
        </p>
        <pre style={{
          background: '#fee2e2',
          padding: '15px',
          borderRadius: '8px',
          overflow: 'auto',
          maxWidth: '90%',
          fontSize: '0.9rem'
        }}>
          {error.message}
        </pre>
      </div>
    );
  }
};

// Point d'entrée principal sécurisé
const main = () => {
  try {
    console.log('🚀 SpotBulle - Initialisation...');
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error("Élément racine 'root' non trouvé");
    }
    
    console.log('📦 Création du root React...');
    const root = createRoot(container);
    
    console.log('🎨 Rendu de SpotBulle...');
    root.render(
      <React.StrictMode>
        <SpotBulleApp />
      </React.StrictMode>
    );
    
    console.log('✅ SpotBulle chargé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur critique SpotBulle:', error);
    
    // Fallback d'urgence
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
          <h1 style="margin-bottom: 20px; font-size: 2rem;">🎯 SpotBulle</h1>
          <h2 style="margin-bottom: 20px; font-size: 1.5rem;">⚠️ Erreur de Chargement</h2>
          <p style="margin-bottom: 20px; text-align: center; max-width: 500px;">
            L'application rencontre des difficultés techniques.
          </p>
          <pre style="
            background: #fee2e2; 
            padding: 15px; 
            border-radius: 8px; 
            overflow: auto;
            max-width: 90%;
            font-size: 0.9rem;
            margin-bottom: 20px;
          ">${error.message}</pre>
          <button onclick="window.location.reload()" style="
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

// Exécuter SpotBulle
main();
