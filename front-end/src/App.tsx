import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PodsPage from './pages/PodsPage';
import MatchesPage from './pages/MatchesPage';
import VideoServicePage from './pages/VideoServicePage';
import TranscriptionServicePage from './pages/TranscriptionServicePage';
import NotFoundPage from './pages/NotFoundPage';

// Composant App complet avec tous les providers et routes
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            } />
            <Route path="/resources" element={
              <MainLayout>
                <ResourcesPage />
              </MainLayout>
            } />
            <Route path="/login" element={
              <MainLayout>
                <LoginPage />
              </MainLayout>
            } />
            <Route path="/register" element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            } />
            <Route path="/profile" element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            } />
            <Route path="/pods" element={
              <MainLayout>
                <PodsPage />
              </MainLayout>
            } />
            <Route path="/matches" element={
              <MainLayout>
                <MatchesPage />
              </MainLayout>
            } />
            <Route path="/video-service" element={
              <MainLayout>
                <VideoServicePage />
              </MainLayout>
            } />
            <Route path="/transcription-service" element={
              <MainLayout>
                <TranscriptionServicePage />
              </MainLayout>
            } />
            <Route path="*" element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
