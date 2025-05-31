import React from 'react';

interface AudioResourceCardProps {
  title: string;
  description: string;
  audioSrc: string;
}

const AudioResourceCard: React.FC<AudioResourceCardProps> = ({ title, description, audioSrc }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    // Vérifier si la source audio existe
    const audio = new Audio(audioSrc);
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setError("La ressource audio n'a pas pu être chargée");
      console.error(`Erreur de chargement audio: ${audioSrc}`);
    };
    
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    // Nettoyer les écouteurs d'événements
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioSrc]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Erreur de lecture audio:', err);
          setError("Impossible de lire l'audio");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-12 bg-gray-100 dark:bg-gray-700 rounded">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement de l'audio...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded mb-2">
          {error}
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayPause}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isPlaying ? "Lecture en cours..." : "Cliquez pour écouter"}
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioResourceCard;
