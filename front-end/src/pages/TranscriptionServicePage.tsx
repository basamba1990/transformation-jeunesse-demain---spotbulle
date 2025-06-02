import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { podService } from '../services/api';

const TranscriptionServicePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pods, setPods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simuler le chargement des pods
  React.useEffect(() => {
    if (isAuthenticated) {
      const loadPods = async () => {
        try {
          // Utiliser le service API réel ou simuler des données
          const fetchedPods = await podService.fetchMyPods();
          setPods(fetchedPods);
        } catch (err) {
          console.error("Erreur lors de la récupération des pods:", err);
          setError("Impossible de charger vos pods audio.");
        } finally {
          setLoading(false);
        }
      };
      
      loadPods();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Vérifier que c'est bien un fichier audio
      if (!file.type.startsWith('audio/')) {
        setError('Veuillez sélectionner un fichier audio valide');
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Veuillez sélectionner un fichier audio');
      return;
    }

    setTranscribing(true);
    setError(null);

    try {
      // Simulation de transcription - à remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Exemple de résultat de transcription
      setTranscription("Ceci est un exemple de transcription automatique générée à partir de votre fichier audio. Dans une implémentation réelle, ce texte serait le résultat d'un service de reconnaissance vocale comme Whisper d'OpenAI ou un autre service similaire.");
      
      // Message de succès
      console.log('Audio transcrit avec succès');
    } catch (err) {
      setError('Erreur lors de la transcription de l\'audio');
      console.error('Erreur transcription:', err);
    } finally {
      setTranscribing(false);
    }
  };

  const handleTranscribePod = async (podId: number) => {
    setTranscribing(true);
    setError(null);
    setTranscription(null);

    try {
      // Appel au service de transcription
      const success = await podService.transcribePod(podId);
      
      if (success) {
        // Simuler une transcription pour l'exemple
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTranscription("Ceci est un exemple de transcription automatique générée à partir de votre pod audio. Dans une implémentation réelle, ce texte serait récupéré depuis l'API après traitement par un service de reconnaissance vocale.");
      } else {
        throw new Error("La transcription a échoué");
      }
    } catch (err) {
      setError('Erreur lors de la transcription du pod');
      console.error('Erreur transcription pod:', err);
    } finally {
      setTranscribing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Service de Transcription</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <p className="text-lg">Veuillez vous connecter pour accéder au service de transcription.</p>
          <a href="/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Service de Transcription</h1>
      <p className="text-lg mb-8">
        Convertissez vos fichiers audio en texte grâce à notre service de transcription automatique.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Transcription d'un nouveau fichier audio</h2>
        
        <form onSubmit={handleTranscribe} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
              Sélectionner un fichier audio
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={!audioFile || transcribing}
            className={`px-4 py-2 rounded-md text-white ${
              !audioFile || transcribing
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {transcribing ? 'Transcription en cours...' : 'Transcrire'}
          </button>
        </form>
      </div>

      {transcription && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Résultat de la transcription</h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Télécharger en TXT
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Copier
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Mes Pods Audio</h2>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : pods.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas encore créé de pods audio.
          </p>
        ) : (
          <div className="space-y-4">
            {pods.map((pod, index) => (
              <div key={pod.id || index} className="border rounded-md p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{pod.title || `Pod #${index + 1}`}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pod.transcription ? 'Transcrit' : 'Non transcrit'}
                  </p>
                </div>
                <button
                  onClick={() => handleTranscribePod(pod.id || index)}
                  disabled={transcribing}
                  className={`px-3 py-1 rounded-md text-white ${
                    transcribing
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {pod.transcription ? 'Retranscrire' : 'Transcrire'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionServicePage;
