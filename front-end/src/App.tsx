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
import PodsCreatePage from './pages/PodsCreatePage';
import MatchesPage from './pages/MatchesPage';
import './index.css';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
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
            <Route path="/profile/me" element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            } />
            <Route path="/pods" element={
              <MainLayout>
                <PodsPage />
              </MainLayout>
            } />
            <Route path="/pods/create" element={
              <MainLayout>
                <PodsCreatePage />
              </MainLayout>
            } />
            <Route path="/matches" element={
              <MainLayout>
                <MatchesPage />
              </MainLayout>
            } />
            <Route path="*" element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
