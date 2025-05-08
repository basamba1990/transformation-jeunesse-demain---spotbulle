// frontend/src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-darkest text-neutral-light p-6 mt-auto shadow-inner">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Spotbulle. Tous droits réservés.</p>
        <p className="mt-1">Une application développée avec passion.</p>
        {/* Vous pouvez ajouter des liens discrets ici si nécessaire, par exemple vers des mentions légales ou une page "À propos" */}
        {/* 
        <div className="mt-2">
          <a href="/terms" className="text-neutral-default hover:text-neutral-lightest mx-2">Conditions d'utilisation</a>
          <span className="text-neutral-default">|</span>
          <a href="/privacy" className="text-neutral-default hover:text-neutral-lightest mx-2">Politique de confidentialité</a>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;

