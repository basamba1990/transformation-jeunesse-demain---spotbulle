import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">À propos</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              SpotBulle est une plateforme dédiée à la jeunesse, permettant de partager sa voix, 
              découvrir des contenus inspirants et se connecter avec d'autres passionnés.
            </p>
            <div className="flex items-center text-neutral-500 dark:text-neutral-400">
              <span>Fait avec</span>
              <Heart size={16} className="mx-1 text-red-500" />
              <span>par l'équipe SpotBulle</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">Liens utiles</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.1jeune1solution.gouv.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors flex items-center"
                >
                  1 jeune, 1 solution
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.onisep.fr/avenir-s" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors flex items-center"
                >
                  Onisep - Avenir(s)
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <Link 
                  to="/resources" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  Ressources
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">Contact</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              Vous avez des questions ou des suggestions ?
            </p>
            <a 
              href="mailto:contact@spotbulle.com" 
              className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              contact@spotbulle.com
            </a>
            
            <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-dark-border">
              <h4 className="text-sm font-medium mb-3 text-neutral-900 dark:text-neutral-100">Nos partenaires</h4>
              <div className="flex flex-wrap items-center gap-6">
                <a href="https://genup2050.org" target="_blank" rel="noopener noreferrer" className="block">
                  <img 
                    src="/assets/logo_genup2050.png" 
                    alt="GenUP 2050" 
                    className="h-12 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-dark-border text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} SpotBulle. Tous droits réservés.</p>
          <p className="mt-1">Une application développée avec passion.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
