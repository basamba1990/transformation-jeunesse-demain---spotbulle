import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Sun, Moon, User, LogOut, Video, FileAudio } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Détecter le défilement pour ajouter un effet visuel à la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex items-center">
              <img 
                src="/assets/logo_spotbulle.png" 
                alt="SpotBulle" 
                className="h-10 w-auto" 
              />
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Accueil
            </Link>
            
            <Link 
              to="/pods" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/pods') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Pods
            </Link>
            
            <Link 
              to="/resources" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/resources') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Ressources
            </Link>
            
            <Link 
              to="/video-service" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/video-service') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <Video size={16} className="mr-1" />
                Vidéo
              </div>
            </Link>
            
            <Link 
              to="/transcription-service" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/transcription-service') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <FileAudio size={16} className="mr-1" />
                Transcription
              </div>
            </Link>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Bouton thème */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
              aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAuthenticated ? (
              <div className="relative">
                {/* Avatar utilisateur */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                </button>
                
                {/* Menu utilisateur */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-md shadow-lg py-1 z-10 border border-neutral-200 dark:border-dark-border">
                    <div className="px-4 py-2 border-b border-neutral-200 dark:border-dark-border">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.full_name || 'Utilisateur'}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        Mon profil
                      </div>
                    </Link>
                    
                    <button 
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button asChild variant="primary" size="sm">
                  <Link to="/register">Inscription</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Menu mobile - Bouton */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Bouton thème */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
              aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Bouton menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile - Contenu */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setMobileMenuOpen(false)}>
        <div 
          className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-dark-surface shadow-xl transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-border/50 transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>
          
          {isAuthenticated && (
            <div className="p-4 border-b border-neutral-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={20} />}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">{user?.full_name || 'Utilisateur'}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="py-2">
            <Link 
              to="/" 
              className={`block px-4 py-3 text-base font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            
            <Link 
              to="/pods" 
              className={`block px-4 py-3 text-base font-medium transition-colors ${
                location.pathname.startsWith('/pods') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pods
            </Link>
            
            <Link 
              to="/resources" 
              className={`block px-4 py-3 text-base font-medium transition-colors ${
                location.pathname.startsWith('/resources') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ressources
            </Link>
            
            <Link 
              to="/video-service" 
              className={`block px-4 py-3 text-base font-medium transition-colors ${
                location.pathname.startsWith('/video-service') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Video size={18} className="mr-3" />
                Service Vidéo
              </div>
            </Link>
            
            <Link 
              to="/transcription-service" 
              className={`block px-4 py-3 text-base font-medium transition-colors ${
                location.pathname.startsWith('/transcription-service') 
                  ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <FileAudio size={18} className="mr-3" />
                Service Transcription
              </div>
            </Link>
          </div>
          
          {isAuthenticated ? (
            <div className="border-t border-neutral-200 dark:border-dark-border py-2">
              <Link 
                to="/profile" 
                className="block px-4 py-3 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-border/30 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User size={18} className="mr-3" />
                  Mon profil
                </div>
              </Link>
              
              <button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-neutral-50 dark:hover:bg-dark-border/30 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut size={18} className="mr-3" />
                  Déconnexion
                </div>
              </button>
            </div>
          ) : (
            <div className="border-t border-neutral-200 dark:border-dark-border p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button asChild variant="primary" size="lg" className="w-full">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Inscription
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
