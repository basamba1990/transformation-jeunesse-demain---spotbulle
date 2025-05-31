import React from 'react';
// Méthode 1: Import direct des images (recommandé)
import logoSpotbulle from '../assets/logo_spotbulle.png';
import huxeParticles from '../assets/huxe_particles.jpg';

// Méthode 2: Utilisation de import.meta.env.BASE_URL pour les chemins absolus
const logoGenup = `${import.meta.env.BASE_URL}assets/logo_genup2050.png`;
const spotterImage = `${import.meta.env.BASE_URL}assets/spotter_sa_voix.jpg`;

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        {/* Méthode 1: Utilisation de l'image importée */}
        <div className="flex items-center">
          <img 
            src={logoSpotbulle} 
            alt="Logo SpotBulle" 
            className="h-12 w-auto mr-4" 
          />
          <h1 className="text-2xl font-bold text-blue-800">SpotBulle</h1>
        </div>
        
        {/* Méthode 2: Utilisation du chemin absolu avec BASE_URL */}
        <div className="hidden md:block">
          <img 
            src={logoGenup} 
            alt="Logo GenUp 2050" 
            className="h-10 w-auto" 
          />
        </div>
      </div>
      
      {/* Exemple d'image de fond */}
      <div 
        className="w-full h-64 bg-cover bg-center" 
        style={{ backgroundImage: `url(${huxeParticles})` }}
      >
        <div className="flex items-center justify-center h-full">
          <h2 className="text-white text-3xl font-bold">Spreading Your Voice, Pitch Your Path</h2>
        </div>
      </div>
    </header>
  );
};

export default Header;
