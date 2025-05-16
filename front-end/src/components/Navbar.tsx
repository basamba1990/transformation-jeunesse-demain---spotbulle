// frontend/src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assurez-vous que le chemin est correct
import { LogOut, UserCircle, Home, Mic2, Users, Settings, Menu, X } from 'lucide-react'; // Icônes Lucide

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinkClasses = (
    { isActive }: { isActive: boolean })
    : string => {
    return `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out 
            ${isActive 
                ? "bg-primary-500 text-white shadow-inner" 
                : "text-neutral-lightest hover:bg-primary-400 hover:text-white"
            }`;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-primary-600/90 backdrop-blur-md shadow-lg py-2" 
        : "bg-primary-600 py-4"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="text-2xl font-display font-bold text-white group-hover:text-accent-300 transition-colors duration-300">
                Spot<span className="text-accent-300 group-hover:text-white transition-colors duration-300">bulle</span>
              </h1>
            </Link>
          </div>
          
          {/* Navigation desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={navLinkClasses} end>
                <Home size={18} className="mr-2" /> Accueil
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/pods" className={navLinkClasses}>
                    <Mic2 size={18} className="mr-2" /> Pods
                  </NavLink>
                  <NavLink to="/matches" className={navLinkClasses}>
                     <Users size={18} className="mr-2" /> Matches
                  </NavLink>
                </>
              )}
            </div>
          </div>
          
          {/* Menu utilisateur desktop */}
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <div className="ml-4 flex items-center md:ml-6">
                <span className="text-neutral-lightest mr-3 text-sm font-handwritten text-lg">Bonjour, {user.full_name || user.email}!</span>
                <div className="relative group">
                  <button 
                    type="button" 
                    className="max-w-xs bg-primary-400 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-500 focus:ring-white p-1 hover:bg-primary-300 transition-all duration-300"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <UserCircle size={28} className="text-white" />
                  </button>
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white dark:bg-dark-surface ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 ease-in-out scale-95 group-hover:scale-100 group-focus-within:scale-100 transform" 
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu-button"
                  >
                    <NavLink 
                        to="/profile/me" 
                        className={({ isActive }) => 
                            `block px-4 py-2 text-sm ${isActive ? "bg-neutral-light dark:bg-dark-border text-primary-600 dark:text-primary-300" : "text-neutral-dark dark:text-dark-text hover:bg-neutral-light dark:hover:bg-dark-border hover:text-primary-500 dark:hover:text-primary-300"}`
                        }
                        role="menuitem"
                    >
                        <UserCircle size={16} className="inline mr-2" /> Mon Profil
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-neutral-dark dark:text-dark-text hover:bg-neutral-light dark:hover:bg-dark-border hover:text-danger"
                      role="menuitem"
                    >
                      <LogOut size={16} className="inline mr-2 text-danger" /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <NavLink to="/login" className="btn-artisanal inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary-400 text-white hover:bg-primary-300 transition-all duration-300">
                  Connexion
                </NavLink>
                <NavLink to="/register" 
                  className="btn-artisanal inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-accent-400 hover:bg-accent-500 text-white transition-all duration-300">
                  Inscription
                </NavLink>
              </div>
            )}
          </div>
          
          {/* Menu burger pour mobile */}
          <div className="flex md:hidden">
            {isAuthenticated ? (
              <button
                onClick={toggleMobileMenu}
                className="bg-primary-500 p-2 rounded-md inline-flex items-center justify-center text-white hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-300"
              >
                <span className="sr-only">Ouvrir le menu</span>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            ) : (
              <div className="flex space-x-2">
                <NavLink to="/login" className="btn-artisanal inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-primary-400 text-white hover:bg-primary-300 transition-all duration-300">
                  Connexion
                </NavLink>
                <button
                  onClick={toggleMobileMenu}
                  className="bg-primary-500 p-2 rounded-md inline-flex items-center justify-center text-white hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-300"
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Menu mobile */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-700 rounded-lg shadow-inner">
            <NavLink to="/" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'text-neutral-lightest hover:bg-primary-400 hover:text-white'
                } transition-colors duration-300`
              }
              onClick={() => setMobileMenuOpen(false)}
              end
            >
              <Home size={18} className="inline-block mr-2" /> Accueil
            </NavLink>
            
            {isAuthenticated && (
              <>
                <NavLink to="/pods"
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'text-neutral-lightest hover:bg-primary-400 hover:text-white'
                    } transition-colors duration-300`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mic2 size={18} className="inline-block mr-2" /> Pods
                </NavLink>
                
                <NavLink to="/matches"
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'text-neutral-lightest hover:bg-primary-400 hover:text-white'
                    } transition-colors duration-300`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users size={18} className="inline-block mr-2" /> Matches
                </NavLink>
                
                <NavLink to="/profile/me"
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'text-neutral-lightest hover:bg-primary-400 hover:text-white'
                    } transition-colors duration-300`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle size={18} className="inline-block mr-2" /> Mon Profil
                </NavLink>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-lightest hover:bg-danger hover:text-white transition-colors duration-300"
                >
                  <LogOut size={18} className="inline-block mr-2" /> Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
