import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileAudio, Upload, FileText, Download, Mic, Zap, Clock } from 'lucide-react';

const TranscriptionServicePageDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTranscribe = () => {
    setTranscribing(true);
    // Simulation de la transcription
    setTimeout(() => {
      setTranscribing(false);
      setTranscription(`Bonjour et bienvenue dans cette démonstration du service de transcription de SpotBulle. 

Notre service utilise une intelligence artificielle avancée pour convertir vos fichiers audio en texte avec une précision remarquable. 

Que ce soit pour des podcasts, des réunions, des interviews ou des capsules audio personnelles, notre technologie s'adapte à différents accents et langues.

Les fonctionnalités incluent :
- Transcription automatique en temps réel
- Support de multiples formats audio
- Détection automatique de la langue
- Horodatage précis
- Export en différents formats

Cette transcription a été générée automatiquement à partir de votre fichier audio. Vous pouvez maintenant l'éditer, la télécharger ou l'intégrer directement dans vos projets.`);
    }, 4000);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulation d'enregistrement
      setTimeout(() => {
        setIsRecording(false);
        setSelectedFile(new File([""], "enregistrement-demo.wav", { type: "audio/wav" }));
      }, 5000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header avec notification démo */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full mr-3">
            <FileAudio className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-green-800 dark:text-green-200 font-medium">Service Transcription - Mode Démonstration</h3>
            <p className="text-green-600 dark:text-green-300 text-sm">
              Découvrez notre IA de transcription audio-texte. Connectez-vous pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Service de Transcription Audio
        </h1>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Précision</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">50+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Langues</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2x</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Plus Rapide</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Disponible</div>
          </div>
        </div>

        {/* Interface de transcription */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Transcrire un Audio
          </h2>

          {/* Options d'input */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Télécharger un fichier</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                MP3, WAV, M4A, FLAC (max 500MB)
              </p>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                Choisir un fichier
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Mic className={`h-8 w-8 mx-auto mb-3 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Enregistrer en direct</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Enregistrement haute qualité
              </p>
              <button
                onClick={handleRecord}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRecording ? 'Arrêter' : 'Commencer'}
              </button>
            </div>
          </div>

          {/* Fichier sélectionné */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <FileAudio className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedFile.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Enregistrement'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Supprimer
                </button>
              </div>

              {!transcribing && !transcription && (
                <button
                  onClick={handleTranscribe}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Lancer la Transcription
                </button>
              )}

              {transcribing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Transcription en cours...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analyse audio et conversion en texte</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                    <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                </div>
              )}

              {transcription && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full mr-3">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-green-800 dark:text-green-200 font-medium">Transcription Terminée !</h3>
                        <p className="text-green-600 dark:text-green-300 text-sm">
                          Votre audio a été transcrit avec succès.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-800 dark:text-white">Transcription</h3>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                          Éditer
                        </button>
                        <button className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {transcription}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Export TXT
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Export DOCX
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fonctionnalités avancées */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mb-4">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Horodatage</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Timestamps précis pour chaque phrase et paragraphe
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">IA Avancée</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Reconnaissance vocale de dernière génération
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit mb-4">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Multi-format</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Export en TXT, PDF, DOCX, SRT et plus
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Prêt à transcrire vos audios avec notre IA ?
          </p>
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors inline-flex items-center"
          >
            <FileAudio className="h-5 w-5 mr-2" />
            Commencer Maintenant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionServicePageDemo;

