import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IUser } from "../services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthContextType>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    login: (token, user) => {
      localStorage.setItem("spotbulle_token", token);
      setState(prev => ({ ...prev, isAuthenticated: true, user, token }));
    },
    logout: () => {
      localStorage.removeItem("spotbulle_token");
      setState(prev => ({ ...prev, isAuthenticated: false, user: null, token: null }));
    }
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("spotbulle_token");
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setState(prev => ({ ...prev, isAuthenticated: true, user, isLoading: false }));
        } catch {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    verifyAuth();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
