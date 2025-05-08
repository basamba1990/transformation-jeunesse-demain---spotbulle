// frontend/src/layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Pour afficher le contenu des routes enfants
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Les pages spécifiques seront rendues ici */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

