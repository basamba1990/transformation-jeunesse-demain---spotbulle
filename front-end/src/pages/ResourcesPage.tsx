import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import AudioResourceCard from '../components/AudioResourceCard';

const ResourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-neutral-900 dark:text-neutral-100">
          Ressources pour la jeunesse
        </h1>
        
        {/* Liens externes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
            Sites partenaires
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a 
              href="https://www.1jeune1solution.gouv.fr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-6 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">1 jeune, 1 solution</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Plateforme pour aider les jeunes à trouver un emploi, une formation ou un accompagnement.
              </p>
              <span className="text-primary-500 flex items-center">
                Découvrir <ArrowRight size={16} className="ml-1" />
              </span>
            </a>
            
            <a 
              href="https://www.onisep.fr/avenir-s" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-6 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Onisep - Avenir(s)</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Informations et conseils sur les métiers, les formations et l'orientation.
              </p>
              <span className="text-primary-500 flex items-center">
                Explorer <ArrowRight size={16} className="ml-1" />
              </span>
            </a>
            
            <div className="block p-6 bg-white dark:bg-dark-surface rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Partenaire GenUP 2050</h3>
              <div className="flex justify-center my-4">
                <img 
                  src="/assets/logo_genup2050.png" 
                  alt="GenUP 2050" 
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                Notre partenaire pour la transformation et l'accompagnement de la jeunesse.
              </p>
            </div>
          </div>
        </section>
        
        {/* Ressources audio */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
            Ressources audio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AudioResourceCard 
              title="Modèle économique"
              description="Présentation du modèle économique de SpotBulle et de son impact sur la jeunesse."
              audioSrc="/assets/audio/EconomicModel.wav"
            />
            
            <AudioResourceCard 
              title="Transformation Jeunesse"
              description="Comment SpotBulle accompagne la transformation de la jeunesse."
              audioSrc="/assets/audio/sample.mp3"
            />
          </div>
        </section>
        
        {/* Inspiration */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
            Inspiration
          </h2>
          
          <div className="bg-purple-600 rounded-xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Spotter sa voix, c'est révéler sa beauté intérieure
                </h3>
                <p className="text-purple-100 mb-2">
                  Tu n'es pas là pour réciter, mais pour vibrer.
                </p>
                <p className="text-purple-100">
                  Chez SpotBulle, on t'aide à transformer ton énergie en message, ton vécu en impact.
                </p>
              </div>
              <div className="relative h-full min-h-[300px] md:min-h-0">
                <img 
                  src="/assets/spotter_sa_voix.jpg" 
                  alt="Jeune au microphone" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Guides et tutoriels */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
            Guides et tutoriels
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                Comment créer un pod impactant
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Apprenez à structurer votre message pour maximiser son impact et toucher votre audience.
              </p>
              <Link 
                to="/guides/create-pod" 
                className="text-primary-500 flex items-center hover:text-primary-600 transition-colors"
              >
                Lire le guide <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                Comprendre votre profil DISC
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Découvrez comment interpréter votre profil DISC et l'utiliser pour améliorer vos interactions.
              </p>
              <Link 
                to="/guides/disc-profile" 
                className="text-primary-500 flex items-center hover:text-primary-600 transition-colors"
              >
                Lire le guide <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                Trouver sa voie professionnelle
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Conseils et exercices pour vous aider à identifier vos passions et trouver votre chemin.
              </p>
              <Link 
                to="/guides/career-path" 
                className="text-primary-500 flex items-center hover:text-primary-600 transition-colors"
              >
                Lire le guide <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResourcesPage;
