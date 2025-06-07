import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/MainLayout";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PodsPage from "./pages/PodsPage";
import PodCreatePage from "./pages/PodCreatePage";
import PodEditPage from "./pages/PodEditPage";
import MatchesPage from "./pages/MatchesPage";
import ResourcesPage from "./pages/ResourcesPage";
import TranscriptionServicePage from "./pages/TranscriptionServicePage";
import VideoServicePage from "./pages/VideoServicePage";
import NotFoundPage from "./pages/NotFoundPage";

// Composant pour protéger les routes qui nécessitent une authentification
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/login" 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
      </div>
    );
  }
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Afficher le contenu protégé si l'utilisateur est authentifié
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          
          {/* Pages d'authentification */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Page de profil (protégée) */}
          <Route path="/profile" element={
            <MainLayout>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </MainLayout>
          } />
          
          {/* Pages de pods */}
          <Route path="/pods" element={
            <MainLayout>
              <PodsPage />
            </MainLayout>
          } />
          
          {/* Création et édition de pods (protégées) */}
          <Route path="/pods/create" element={
            <MainLayout>
              <ProtectedRoute>
                <PodCreatePage />
              </ProtectedRoute>
            </MainLayout>
          } />
          
          <Route path="/pods/edit/:id" element={
            <MainLayout>
              <ProtectedRoute>
                <PodEditPage />
              </ProtectedRoute>
            </MainLayout>
          } />
          
          {/* Page de matches (protégée) */}
          <Route path="/matches" element={
            <MainLayout>
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            </MainLayout>
          } />
          
          {/* Page de ressources */}
          <Route path="/resources" element={
            <MainLayout>
              <ResourcesPage />
            </MainLayout>
          } />
          
          {/* Services */}
          <Route path="/transcription-service" element={
            <MainLayout>
              <TranscriptionServicePage />
            </MainLayout>
          } />
          
          <Route path="/video-service" element={
            <MainLayout>
              <VideoServicePage />
            </MainLayout>
          } />
          
          {/* Page 404 */}
          <Route path="*" element={
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

