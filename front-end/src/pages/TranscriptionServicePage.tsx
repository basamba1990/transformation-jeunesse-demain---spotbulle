import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { transcriptionService } from "../services/api";
import { Upload, Mic, Clock, Cpu, FileText, Download, Copy, CheckCircle } from "lucide-react";
import Alert from "../components/Alert";
import { logError } from "../utils/debug";

const TranscriptionServicePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDemoMode } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Vérifier le type de fichier
      const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/flac"];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Format de fichier non supporté. Veuillez utiliser MP3, WAV, M4A ou FLAC.");
        return;
      }
      
      // Vérifier la taille du fichier (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB en octets
      if (selectedFile.size > maxSize) {
        setError("Le fichier est trop volumineux. La taille maximale est de 500MB.");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier audio à transcrire.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setTranscription(null);
    
    try {
      const result = await transcriptionService.transcribeAudio(file);
      setTranscription(result);
    } catch (err: any) {
      logError("Erreur lors de la transcription:", err);
      setError(err.message || "Une erreur est survenue lors de la transcription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          logError("Erreur lors de la copie dans le presse-papiers:", err);
          setError("Impossible de copier dans le presse-papiers.");
        });
    }
  };

  const handleDownload = () => {
    if (transcription) {
      const blob = new Blob([transcription], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcription_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Afficher un message si l'utilisateur est en mode démo
  const renderDemoModeWarning = () => {
    if (isDemoMode) {
      return (
        <Alert 
          type="info" 
          message="Vous êtes en mode démonstration. La transcription générée sera fictive." 
        />
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Service Transcription - Mode Démonstration</h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>Découvrez notre IA de transcription audio-texte. Connectez-vous pour accéder à toutes les fonctionnalités.</p>
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
        Service de Transcription Audio
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 text-center">
          <div className="text-primary-500 text-3xl font-bold mb-1">98%</div>
          <div className="text-neutral-600 dark:text-neutral-400">Précision</div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 text-center">
          <div className="text-green-500 text-3xl font-bold mb-1">50+</div>
          <div className="text-neutral-600 dark:text-neutral-400">Langues</div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 text-center">
          <div className="text-purple-500 text-3xl font-bold mb-1">2x</div>
          <div className="text-neutral-600 dark:text-neutral-400">Plus Rapide</div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 text-center">
          <div className="text-orange-500 text-3xl font-bold mb-1">24/7</div>
          <div className="text-neutral-600 dark:text-neutral-400">Disponible</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        Transcrire un Audio
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Upload className="text-primary-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Télécharger un fichier
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            MP3, WAV, M4A, FLAC (max 500MB)
          </p>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-dark-border rounded-lg p-6 mb-4 cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".mp3,.wav,.m4a,.flac,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/flac"
              className="hidden"
            />
            <Upload size={40} className="text-neutral-400 dark:text-neutral-500 mb-2" />
            <p className="text-neutral-600 dark:text-neutral-400 text-center">
              Cliquez pour sélectionner un fichier ou glissez-déposez ici
            </p>
            {file && (
              <div className="mt-4 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-md w-full">
                <p className="text-primary-700 dark:text-primary-300 text-sm truncate">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleTranscribe}
            disabled={!file || isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              !file || isLoading
                ? "bg-neutral-300 dark:bg-dark-border text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600 text-white"
            } transition-colors`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Transcription en cours...
              </div>
            ) : (
              "Transcrire"
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Mic className="text-primary-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Enregistrer en direct
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Enregistrement haute qualité
          </p>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-dark-border rounded-lg p-6 mb-4">
            <Mic size={40} className="text-neutral-400 dark:text-neutral-500 mb-2" />
            <p className="text-neutral-600 dark:text-neutral-400 text-center">
              Fonctionnalité disponible prochainement
            </p>
          </div>
          <button
            disabled
            className="w-full py-2 px-4 bg-neutral-300 dark:bg-dark-border text-neutral-500 dark:text-neutral-400 rounded-md font-medium cursor-not-allowed"
          >
            Commencer l'enregistrement
          </button>
        </div>
      </div>

      {transcription && (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="text-primary-500 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Résultat de la transcription
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyToClipboard}
                className="p-2 rounded-md bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border/70 transition-colors"
                title="Copier dans le presse-papiers"
              >
                {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-md bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border/70 transition-colors"
                title="Télécharger en TXT"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          <div className="bg-neutral-50 dark:bg-dark-border/20 rounded-lg p-4 max-h-96 overflow-y-auto">
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Clock className="text-blue-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Horodatage
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Timestamps précis pour chaque phrase et paragraphe
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Cpu className="text-green-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              IA Avancée
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Reconnaissance vocale de dernière génération
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FileText className="text-purple-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Multi-format
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Export en TXT, PDF, DOCX, SRT et plus
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Prêt à transcrire vos audios avec notre IA ?
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

export default TranscriptionServicePage;

