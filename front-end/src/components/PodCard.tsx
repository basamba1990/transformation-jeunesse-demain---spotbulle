import React from 'react';
import { IPod } from '../services/api';
import { FileText } from 'lucide-react';

interface PodCardProps {
  pod: IPod;
  onClick?: (pod: IPod) => void;
}

const PodCard: React.FC<PodCardProps> = ({ pod, onClick }) => {
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div 
      className="bg-white dark:bg-dark-surface shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick && onClick(pod)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 line-clamp-1">{pod.title}</h2>
          {pod.transcription && (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full">
              Transcrit
            </span>
          )}
        </div>
        
        <p className="text-neutral-700 dark:text-neutral-300 mb-4 text-sm line-clamp-2">
          {pod.description || "Pas de description disponible."}
        </p>
        
        {pod.audio_file_url && (
          <div className="my-3">
            <audio 
              controls 
              src={pod.audio_file_url} 
              className="w-full" 
              onClick={(e) => e.stopPropagation()}
            >
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            {pod.created_at && formatDate(pod.created_at)}
          </span>
          <div className="flex items-center">
            {pod.transcription ? (
              <FileText size={14} className="mr-1 text-green-500" />
            ) : null}
            <span className="mr-1">ID:</span>
            <span className="font-mono">{pod.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodCard;
