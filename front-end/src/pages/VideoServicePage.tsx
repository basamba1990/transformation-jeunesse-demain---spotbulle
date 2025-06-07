import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { videoService } from "../services/api";
import { Upload, Video, Settings, Zap, Download } from "lucide-react";
import Alert from "../components/Alert";
import { logError } from "../utils/debug";

const VideoServicePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDemoMode } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Vérifier le type de fichier
      const validTypes = ["video/mp4", "video/avi", "video/quicktime", "video/x-ms-wmv"];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Format de fichier non supporté. Veuillez utiliser MP4, AVI, MOV ou WMV.");
        return;
      }
      
      // Vérifier la taille du fichier (max 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB en octets
      if (selectedFile.size > maxSize) {
        setError("Le fichier est trop volumineux. La taille maximale est de 2GB.");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleProcessVideo = async () => {
    if (!file) {
      setError("Veuillez sélectionner une vidéo à traiter.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProcessedVideoUrl(null);
    
    try {
      const result = await videoService.processVideo(file);
      setProcessedVideoUrl(result);
    } catch (err: any) {
      logError("Erreur lors du traitement de la vidéo:", err);
      setError(err.message || "Une erreur est survenue lors du traitement de la vidéo. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un message si l'utilisateur est en mode démo
  const renderDemoModeWarning = () => {
    if (isDemoMode) {
      return (
        <Alert 
          type="info" 
          message="Vous êtes en mode démonstration. Le traitement vidéo sera simulé." 
        />
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Service Vidéo - Mode Démonstration</h3>
            <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
              <p>Découvrez nos outils de traitement vidéo. Connectez-vous pour accéder à toutes les fonctionnalités.</p>
            </div>
          </div>
        </div>
      </div>

      {renderDemoModeWarning()}
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Service de Traitement Vidéo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Upload className="text-blue-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Upload Vidéo
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Téléchargez vos vidéos en haute qualité jusqu'à 2GB
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Settings className="text-green-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Traitement IA
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Amélioration automatique de la qualité et des couleurs
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Zap className="text-yellow-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Traitement Rapide
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Résultats en quelques minutes grâce à notre infrastructure cloud
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        Traiter une Vidéo
      </h2>

      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-dark-border rounded-lg p-8 mb-6 cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".mp4,.avi,.mov,.wmv,video/mp4,video/avi,video/quicktime,video/x-ms-wmv"
            className="hidden"
          />
          <Video size={64} className="text-neutral-400 dark:text-neutral-500 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            Sélectionnez une vidéo
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4">
            Formats supportés: MP4, AVI, MOV, WMV (max 2GB)
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">
            Cliquez pour sélectionner un fichier ou glissez-déposez ici
          </p>
          {file && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md w-full max-w-md">
              <p className="text-primary-700 dark:text-primary-300 font-medium mb-1 truncate">
                {file.name}
              </p>
              <p className="text-primary-600 dark:text-primary-400 text-sm">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleProcessVideo}
            disabled={!file || isLoading}
            className={`py-3 px-8 rounded-full font-medium ${
              !file || isLoading
                ? "bg-neutral-300 dark:bg-dark-border text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600 text-white shadow-md"
            } transition-colors`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Traitement en cours...
              </div>
            ) : (
              "Traiter la vidéo"
            )}
          </button>
        </div>
      </div>

      {processedVideoUrl && (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Résultat du traitement
            </h3>
            <a
              href={processedVideoUrl}
              download="video_traitee.mp4"
              className="flex items-center py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            >
              <Download size={16} className="mr-2" /> Télécharger
            </a>
          </div>
          <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
            <video
              src={processedVideoUrl}
              controls
              className="w-full h-full object-contain"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
            La vidéo traitée est disponible pendant 24 heures. N'oubliez pas de la télécharger.
          </p>
        </div>
      )}

      <div className="bg-neutral-50 dark:bg-dark-border/20 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Exemples de Traitement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
            <div className="p-3 border-b border-neutral-200 dark:border-dark-border">
              <h4 className="font-medium text-neutral-800 dark:text-neutral-200">Avant traitement</h4>
            </div>
            <div className="aspect-w-16 aspect-h-9 bg-neutral-200 dark:bg-dark-border flex items-center justify-center">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Aperçu non disponible en mode démo
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
            <div className="p-3 border-b border-neutral-200 dark:border-dark-border">
              <h4 className="font-medium text-neutral-800 dark:text-neutral-200">Après traitement</h4>
            </div>
            <div className="aspect-w-16 aspect-h-9 bg-neutral-200 dark:bg-dark-border flex items-center justify-center">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Aperçu non disponible en mode démo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Prêt à traiter vos vidéos avec notre IA ?
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="py-3 px-8 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-full shadow-md transition-colors"
        >
          Commencer Maintenant
        </button>
      </div>
    </div>
  );
};

export default VideoServicePage;

