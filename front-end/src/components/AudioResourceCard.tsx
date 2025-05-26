import React, { useState } from 'react';
import { Play, Pause, ExternalLink } from 'lucide-react';

interface AudioResourceProps {
  title: string;
  description: string;
  audioSrc: string;
  externalLink?: string;
}

const AudioResourceCard: React.FC<AudioResourceProps> = ({
  title,
  description,
  audioSrc,
  externalLink
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };
  
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">{title}</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{description}</p>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={togglePlay}
            className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-500 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div className="flex-1 h-2 bg-neutral-200 dark:bg-dark-border rounded-full overflow-hidden">
            {/* Barre de progression */}
            <div 
              className="h-full bg-primary-500 transition-all duration-100" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {externalLink && (
            <a 
              href={externalLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-neutral-500 hover:text-primary-500 transition-colors"
              aria-label="Lien externe"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>
      
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        onEnded={() => setIsPlaying(false)} 
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};

export default AudioResourceCard;
