// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, logoutUser as apiLogout } from '../services/api'; // Assurez-vous que les types User sont définis

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null; // Remplacez 'any' par votre type User
    token: string | null;
    login: (token: string, userData: any) => void; // userData pourrait être le User retourné par getCurrentUser
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('spotbulle_token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyUser = async () => {
            if (token) {
                try {
                    // Il est préférable de ne pas stocker l'objet utilisateur complet dans localStorage
                    // mais de le récupérer à chaque chargement de l'application si un token existe.
                    const currentUser = await getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    console.error("Failed to fetch current user, logging out", error);
                    localStorage.removeItem('spotbulle_token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        verifyUser();
    }, [token]);

    const login = (newToken: string, userData: any) => {
        localStorage.setItem('spotbulle_token', newToken);
        setToken(newToken);
        setUser(userData); // L'utilisateur est maintenant défini après une connexion réussie
    };

    const logout = () => {
        apiLogout(); // Appelle la fonction de api.ts qui supprime le token de localStorage
        setToken(null);
        setUser(null);
        // Redirection vers la page de connexion peut être gérée ici ou dans les composants
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token && !!user, user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

