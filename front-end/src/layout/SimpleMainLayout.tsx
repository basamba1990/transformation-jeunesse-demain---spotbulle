import React, { ReactNode } from 'react';

interface SimpleMainLayoutProps {
  children: ReactNode;
}

const SimpleMainLayout: React.FC<SimpleMainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">SpotBulle</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="hover:text-blue-200">Accueil</a>
            <a href="#" className="hover:text-blue-200">Ressources</a>
            <a href="#" className="hover:text-blue-200">Profil</a>
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

export default SimpleMainLayout;
