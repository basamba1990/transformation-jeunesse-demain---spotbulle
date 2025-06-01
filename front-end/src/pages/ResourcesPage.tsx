import React from 'react';
import AudioResourceCard from '../components/AudioResourceCard';

const ResourcesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Ressources Audio</h1>
      <p className="text-lg mb-8">
        Découvrez notre collection de ressources audio pour vous accompagner dans votre parcours de transformation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AudioResourceCard 
          title="Transformation Jeunesse" 
          description="Comment SpotBulle accompagne la transformation de la jeunesse." 
          audioSrc="/assets/audio/samples_jfk.mp3" 
        />
        
        <AudioResourceCard 
          title="Développement Personnel" 
          description="Techniques et conseils pour votre développement personnel." 
          audioSrc="/assets/audio/samples_jfk.mp3" 
        />
        
        <AudioResourceCard 
          title="Méditation Guidée" 
          description="Une séance de méditation guidée pour la concentration." 
          audioSrc="/assets/audio/samples_jfk.mp3" 
        />
        
        <AudioResourceCard 
          title="Motivation Quotidienne" 
          description="Boostez votre motivation avec ces conseils pratiques." 
          audioSrc="/assets/audio/samples_jfk.mp3" 
        />
      </div>
    </div>
  );
};

export default ResourcesPage;
