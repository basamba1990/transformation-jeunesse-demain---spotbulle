import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Sun, Moon, Menu, X } from "lucide-react";
import { isInDemoMode } from "../utils/auth";
import { showDebugInfo } from "../utils/debug";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isDemoMode } = useAuth();
  const location = useLocation();
  const isDebugMode = showDebugInfo();

  useEffect(() => {
    // Vérifier si le mode sombre est activé dans le localStorage
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    
    // Appliquer la classe au body
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    logout();
    // Rediriger vers la page d'accueil
    window.location.href = "/";
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-dark-background">
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold">
              SpotBulle
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`hover:text-white/80 ${isActive("/") ? "font-semibold" : ""}`}
              >
                Accueil
              </Link>
              <Link 
                to="/resources" 
                className={`hover:text-white/80 ${isActive("/resources") ? "font-semibold" : ""}`}
              >
                Ressources
              </Link>
              <Link 
                to="/profile" 
                className={`hover:text-white/80 ${isActive("/profile") ? "font-semibold" : ""}`}
              >
                Profil
              </Link>
              
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors"
                >
                  Déconnexion
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors"
                >
                  Connexion
                </Link>
              )}
              
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            
            <button 
              className="md:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Indicateur de mode démo */}
        {isDemoMode && (
          <div className="bg-yellow-500 text-black px-4 py-2 text-center">
            Mode démonstration actif - Les données affichées sont fictives
          </div>
        )}
        
        {/* Indicateur de mode debug */}
        {isDebugMode && (
          <div className="bg-purple-600 text-white px-4 py-1 text-center text-sm">
            Mode débogage actif
          </div>
        )}
      </header>
      
      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary text-white">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`hover:text-white/80 ${isActive("/") ? "font-semibold" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/resources" 
              className={`hover:text-white/80 ${isActive("/resources") ? "font-semibold" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ressources
            </Link>
            <Link 
              to="/profile" 
              className={`hover:text-white/80 ${isActive("/profile") ? "font-semibold" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profil
            </Link>
            
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors text-left"
              >
                Déconnexion
              </button>
            ) : (
              <Link 
                to="/login" 
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
            
            <button 
              onClick={toggleDarkMode} 
              className="flex items-center space-x-2 p-2"
            >
              <span>{darkMode ? "Mode clair" : "Mode sombre"}</span>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-neutral-800 dark:bg-dark-surface text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-neutral-400 dark:text-neutral-500">
                © {new Date().getFullYear()} SpotBulle. Tous droits réservés.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-400 dark:text-neutral-500 hover:text-white transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-neutral-400 dark:text-neutral-500 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-neutral-400 dark:text-neutral-500 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

