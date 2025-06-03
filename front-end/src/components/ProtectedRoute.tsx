import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si un token existe
        const token = localStorage.getItem('spotbulle_token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Vérifier la validité du token en récupérant le profil
        await authService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        // En cas d'erreur, essayer de rafraîchir le token
        try {
          await authService.refreshToken();
          setIsAuthenticated(true);
        } catch (refreshError) {
          console.error("Échec du rafraîchissement du token:", refreshError);
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // Afficher un loader pendant la vérification
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Utilisateur authentifié, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
