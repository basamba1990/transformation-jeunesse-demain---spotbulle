import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import ResourcesPage from './pages/ResourcesPage';
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
