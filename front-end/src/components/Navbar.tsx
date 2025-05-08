// frontend/src/components/Navbar.tsx
import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assurez-vous que le chemin est correct
import { LogOut, UserCircle, Home, Mic2, Users, Settings } from 'lucide-react'; // Icônes Lucide

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClasses = (
    { isActive }: { isActive: boolean })
    : string => {
    return `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out 
            ${isActive 
                ? "bg-primary-dark text-white shadow-inner" 
                : "text-neutral-lightest hover:bg-primary-light hover:text-white"
            }`;
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white hover:text-accent transition-colors duration-150">Spotbulle</h1>
            </Link>
          </div>
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
                  {/* Ajoutez d_autres liens principaux ici si nécessaire */}
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <div className="ml-4 flex items-center md:ml-6">
                <span className="text-neutral-lightest mr-3 text-sm">Bonjour, {user.full_name || user.email}!</span>
                <div className="relative group">
                  <button 
                    type="button" 
                    className="max-w-xs bg-primary-dark rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-white p-1 hover:bg-primary-light transition-all"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <UserCircle size={28} className="text-white" />
                  </button>
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ease-in-out scale-95 group-hover:scale-100 group-focus-within:scale-100 transform" 
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu-button"
                  >
                    <NavLink 
                        to="/profile/me" 
                        className={({ isActive }) => 
                            `block px-4 py-2 text-sm ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`
                        }
                        role="menuitem"
                    >
                        <UserCircle size={16} className="inline mr-2" /> Mon Profil
                    </NavLink>
                    {/* <NavLink 
                        to="/settings" 
                        className={({ isActive }) => 
                            `block px-4 py-2 text-sm ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`
                        }
                        role="menuitem"
                    >
                        <Settings size={16} className="inline mr-2" /> Paramètres
                    </NavLink> */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      <LogOut size={16} className="inline mr-2 text-danger" /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <NavLink to="/login" className={navLinkClasses}>
                  Connexion
                </NavLink>
                <NavLink to="/register" 
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors duration-150 ease-in-out">
                  Inscription
                </NavLink>
              </div>
            )}
          </div>
          {/* Menu Burger pour mobile */}
          <div className="-mr-2 flex md:hidden">
            {/* Bouton du menu mobile */}
            {/* L_implémentation du menu burger sera ajoutée si nécessaire */}
            {isAuthenticated ? (
                 <button
                    onClick={handleLogout}
                    className="ml-auto bg-primary-dark p-2 rounded-md inline-flex items-center justify-center text-neutral-lightest hover:text-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                    <span className="sr-only">Déconnexion</span>
                    <LogOut size={20} />
                </button>
            ) : (
                <NavLink to="/login" className={navLinkClasses}>
                  Connexion
                </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

