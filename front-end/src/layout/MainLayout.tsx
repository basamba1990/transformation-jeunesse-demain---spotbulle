import React, { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">SpotBulle</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="/" className="hover:text-blue-200">Accueil</a>
            <a href="/resources" className="hover:text-blue-200">Ressources</a>
            <a href="/profile" className="hover:text-blue-200">Profil</a>
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="hover:text-blue-200"
              >
                Déconnexion
              </button>
            ) : (
              <a href="/login" className="hover:text-blue-200">Connexion</a>
            )}
            <button 
              onClick={toggleDarkMode}
              className="p-1 rounded-full hover:bg-blue-500 focus:outline-none"
              aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </nav>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-800 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 SpotBulle. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
