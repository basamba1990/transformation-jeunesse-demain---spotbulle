import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const VideoServicePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Vérifier que c'est bien un fichier vidéo
      if (!file.type.startsWith('video/')) {
        setError('Veuillez sélectionner un fichier vidéo valide');
        return;
      }
      setVideoFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Veuillez sélectionner un fichier vidéo');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Simulation d'upload - à remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer une URL temporaire pour prévisualiser la vidéo
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      
      // Message de succès
      console.log('Vidéo téléchargée avec succès');
    } catch (err) {
      setError('Erreur lors du téléchargement de la vidéo');
      console.error('Erreur upload:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Service Vidéo</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <p className="text-lg">Veuillez vous connecter pour accéder au service vidéo.</p>
          <a href="/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Service Vidéo</h1>
      <p className="text-lg mb-8">
        Téléchargez et partagez vos vidéos avec la communauté SpotBulle.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Télécharger une vidéo</h2>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
              Sélectionner un fichier vidéo
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={!videoFile || uploading}
            className={`px-4 py-2 rounded-md text-white ${
              !videoFile || uploading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Téléchargement en cours...' : 'Télécharger'}
          </button>
        </form>
      </div>

      {videoUrl && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Aperçu de la vidéo</h2>
          <video
            controls
            className="w-full rounded-md"
            src={videoUrl}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Mes vidéos</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vous n'avez pas encore téléchargé de vidéos.
        </p>
      </div>
    </div>
  );
};

export default VideoServicePage;
