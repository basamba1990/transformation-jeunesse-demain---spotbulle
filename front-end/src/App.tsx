import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';

// Pages simplifiées
const SimpleHomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">SpotBulle - Page d'accueil</h1>
      <p className="text-lg mb-4">Bienvenue sur SpotBulle, votre plateforme de transformation personnelle et de connexion par l'audio.</p>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Découvrez notre mission</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          SpotBulle est une plateforme innovante qui vous permet de partager vos pensées, 
          d'explorer votre personnalité et de vous connecter avec d'autres personnes 
          partageant vos valeurs et vos intérêts.
        </p>
      </div>
    </div>
  );
};

const SimpleResourcesPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Ressources Audio</h1>
      <p className="text-lg mb-8">
        Découvrez notre collection de ressources audio pour vous accompagner dans votre parcours de transformation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Transformation Jeunesse</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Comment SpotBulle accompagne la transformation de la jeunesse.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Développement Personnel</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Techniques et conseils pour votre développement personnel.
          </p>
        </div>
      </div>
    </div>
  );
};

const SimpleProfilePage = () => {
  const isAuthenticated = true; // Pour test
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Profil Utilisateur</h1>
      
      {isAuthenticated ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-xl">UT</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Utilisateur Test</h2>
              <p className="text-gray-600 dark:text-gray-400">test@example.com</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">À propos de moi</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Profil utilisateur simplifié pour tester l'intégration des composants.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <p className="text-lg">Veuillez vous connecter pour accéder à votre profil.</p>
          <a href="/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Se connecter
          </a>
        </div>
      )}
    </div>
  );
};

// Page de connexion
const SimpleLoginPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Connexion</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              placeholder="votre@email.com"
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Mot de passe</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>
        
        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
          <p>Pas encore de compte? <a href="/register" className="text-blue-600 hover:underline">S'inscrire</a></p>
        </div>
      </div>
    </div>
  );
};

// Composant App avec MainLayout et pages principales
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <MainLayout>
                <SimpleHomePage />
              </MainLayout>
            } />
            <Route path="/resources" element={
              <MainLayout>
                <SimpleResourcesPage />
              </MainLayout>
            } />
            <Route path="/profile" element={
              <MainLayout>
                <SimpleProfilePage />
              </MainLayout>
            } />
            <Route path="/login" element={
              <MainLayout>
                <SimpleLoginPage />
              </MainLayout>
            } />
            <Route path="*" element={
              <MainLayout>
                <SimpleHomePage />
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
