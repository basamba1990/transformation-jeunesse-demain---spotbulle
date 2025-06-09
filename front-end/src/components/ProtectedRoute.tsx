import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification d'authentification
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Vérification de l'authentification...
        </span>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    console.log('🔐 Utilisateur non authentifié, redirection vers /login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Utilisateur authentifié, afficher le contenu protégé
  console.log('✅ Utilisateur authentifié, accès autorisé à:', location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;

