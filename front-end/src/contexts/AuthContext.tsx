import React, { ReactNode, createContext, useState, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {},
  register: async () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulation d'une requête API
      // Dans une implémentation réelle, vous feriez un appel à votre API d'authentification
      console.log('Tentative de connexion avec:', email);
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation d'une réponse réussie
      const mockUser: User = {
        id: '123456',
        name: 'Utilisateur Test',
        email: email
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Simulation d'une requête API
      console.log('Tentative d\'inscription avec:', email, name);
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation d'une réponse réussie
      const mockUser: User = {
        id: '123456',
        name: name,
        email: email
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
