import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Upload, Play, Download, Settings, Zap } from 'lucide-react';

const VideoServicePageDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    // Simulation du traitement
    setTimeout(() => {
      setProcessing(false);
      setProcessedVideo("/assets/video/demo-processed.mp4"); // Vidéo de démo
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header avec notification démo */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-full mr-3">
            <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-purple-800 dark:text-purple-200 font-medium">Service Vidéo - Mode Démonstration</h3>
            <p className="text-purple-600 dark:text-purple-300 text-sm">
              Découvrez nos outils de traitement vidéo. Connectez-vous pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Service de Traitement Vidéo
        </h1>

        {/* Fonctionnalités disponibles */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mb-4">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Upload Vidéo</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Téléchargez vos vidéos en haute qualité jusqu'à 2GB
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-4">
              <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Traitement IA</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Amélioration automatique de la qualité et des couleurs
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit mb-4">
              <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Traitement Rapide</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Résultats en quelques minutes grâce à notre infrastructure cloud
            </p>
          </div>
        </div>

        {/* Interface de traitement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Traiter une Vidéo
          </h2>

          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Sélectionnez une vidéo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Formats supportés: MP4, AVI, MOV, WMV (max 2GB)
              </p>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                Choisir un fichier
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <Video className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
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

              {!processing && !processedVideo && (
                <button
                  onClick={handleProcess}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Traiter la Vidéo
                </button>
              )}

              {processing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Traitement en cours...</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                    <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}

              {processedVideo && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full mr-3">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-green-800 dark:text-green-200 font-medium">Traitement Terminé !</h3>
                        <p className="text-green-600 dark:text-green-300 text-sm">
                          Votre vidéo a été traitée avec succès.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <Play className="h-4 w-4 mr-2" />
                      Prévisualiser
                    </button>
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exemples de résultats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Exemples de Traitement
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Avant Traitement</h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Vidéo originale</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Après Traitement</h3>
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 text-center">
                <Zap className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-purple-600 dark:text-purple-300">Vidéo améliorée</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Prêt à traiter vos vidéos avec notre IA ?
          </p>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors inline-flex items-center"
          >
            <Video className="h-5 w-5 mr-2" />
            Commencer Maintenant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VideoServicePageDemo;

