import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const HomePage: React.FC = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Bienvenue sur SpotBulle</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          Votre plateforme de transformation personnelle et de connexion par l'audio.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-3">
            Découvrez notre mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            SpotBulle est une plateforme innovante qui vous permet de partager vos pensées, 
            d'explorer votre personnalité et de vous connecter avec d'autres personnes partageant 
            vos valeurs et vos intérêts.
          </p>
          
          {/* Audio supprimé car le fichier sample.mp3 n'existe pas */}
          <div className="text-sm text-amber-500 mt-2">
            Audio temporairement indisponible
          </div>
          
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
            En savoir plus
          </button>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Nos fonctionnalités</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Capsules Audio</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enregistrez et partagez vos pensées, idées et expériences sous forme de capsules audio.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Profil DISC</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Découvrez votre profil de personnalité DISC et connectez-vous avec des personnes compatibles.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Assistant IA</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Bénéficiez des conseils personnalisés de notre assistant IA pour votre développement personnel.
            </p>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Témoignages</h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <p className="text-gray-600 dark:text-gray-300 italic mb-4">
            "SpotBulle m'a permis de mieux me connaître et de rencontrer des personnes incroyables qui partagent mes valeurs. Une expérience transformative !"
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">SM</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">Sophie Martin</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilisatrice depuis 6 mois</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <p className="text-gray-600 dark:text-gray-300 italic mb-4">
            "Les capsules audio sont un moyen tellement plus authentique de partager mes idées. Je me sens vraiment écouté et compris sur cette plateforme."
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">TD</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">Thomas Dubois</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateur depuis 3 mois</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
