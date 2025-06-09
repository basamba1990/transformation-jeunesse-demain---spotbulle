import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { videoService } from "../services/api";
import { Upload, Video, Settings, Zap, Download, Play, Pause, Trash2, Eye, Share2, FileVideo } from "lucide-react";
import Alert from "../components/Alert";
import { logError } from "../utils/debug";

interface VideoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
  created_at: string;
}

const VideoServicePage: React.FC = () => {
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Gestion du drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    const videoFiles = fileList.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      setError("Veuillez sélectionner des fichiers vidéo valides.");
      return;
    }

    if (videoFiles.length !== fileList.length) {
      setError("Certains fichiers ont été ignorés car ils ne sont pas des vidéos.");
    } else {
      setError(null);
    }

    // Vérifier la taille des fichiers
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    const oversizedFiles = videoFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`Fichiers trop volumineux (max 2GB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Traiter chaque fichier
    videoFiles.forEach(file => processVideoFile(file));
  };

  const processVideoFile = async (file: File) => {
    const videoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newVideo: VideoFile = {
      id: videoId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      created_at: new Date().toISOString()
    };

    setFiles(prev => [...prev, newVideo]);

    try {
      // Créer une URL locale pour la prévisualisation
      const videoUrl = URL.createObjectURL(file);
      
      // Simuler l'upload avec progression
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(v => 
          v.id === videoId ? { ...v, progress } : v
        ));
      }

      // Simuler le traitement
      setFiles(prev => prev.map(v => 
        v.id === videoId ? { ...v, status: 'processing' } : v
      ));

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Marquer comme prêt
      setFiles(prev => prev.map(v => 
        v.id === videoId ? { 
          ...v, 
          status: 'ready',
          url: videoUrl,
          progress: 100
        } : v
      ));

      console.log('✅ Vidéo traitée avec succès');

    } catch (err: any) {
      logError("Erreur lors du traitement de la vidéo:", err);
      setFiles(prev => prev.map(v => 
        v.id === videoId ? { ...v, status: 'error' } : v
      ));
      setError(err.message || "Une erreur est survenue lors du traitement de la vidéo.");
    }
  };

  const handleProcessVideo = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner une vidéo à traiter.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ici on appellerait le service backend
      await videoService.uploadVideo(selectedFile);
      console.log('✅ Vidéo envoyée au backend');
    } catch (err: any) {
      logError("Erreur lors de l'envoi au backend:", err);
      setError(err.message || "Erreur lors de l'envoi de la vidéo au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVideo = (videoId: string) => {
    setFiles(prev => prev.filter(v => v.id !== videoId));
    if (selectedFile?.id === videoId) {
      setSelectedFile(null);
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: VideoFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Settings className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'ready':
        return <Video className="w-4 h-4 text-green-500" />;
      case 'error':
        return <Zap className="w-4 h-4 text-red-500" />;
      default:
        return <Video className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: VideoFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Upload en cours...';
      case 'processing':
        return 'Traitement...';
      case 'ready':
        return 'Prêt';
      case 'error':
        return 'Erreur';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Service Vidéo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Uploadez, traitez et gérez vos vidéos facilement
        </p>
      </div>

      {/* Message d'information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Video className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Service Vidéo SpotBulle</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>Uploadez vos vidéos et profitez de nos outils de traitement avancés.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Zone d'upload */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload de vidéos
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
                Glissez-déposez vos vidéos ici
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Formats supportés: MP4, AVI, MOV, WMV (Max: 2GB)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choisir des fichiers
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Liste des vidéos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileVideo className="w-5 h-5 mr-2" />
                Mes Vidéos ({files.length})
              </h3>
            </div>
            
            <div className="p-6">
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune vidéo
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Commencez par uploader votre première vidéo
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map((video) => (
                    <div
                      key={video.id}
                      className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                        selectedFile?.id === video.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedFile(video)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getStatusIcon(video.status)}
                            <h4 className="font-medium text-gray-900 dark:text-white ml-2 truncate">
                              {video.name}
                            </h4>
                            <span className="ml-2 text-xs text-gray-500">
                              {getStatusText(video.status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <span>{formatFileSize(video.size)}</span>
                            <span>{new Date(video.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>

                          {/* Barre de progression */}
                          {video.status === 'uploading' && video.progress !== undefined && (
                            <div className="mt-2">
                              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${video.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {video.progress}% uploadé
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {video.status === 'ready' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile(video);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Voir"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Logique de partage
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                title="Partager"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteVideo(video.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lecteur vidéo */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm sticky top-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Lecteur Vidéo
              </h3>
            </div>
            
            <div className="p-6">
              {selectedFile && selectedFile.status === 'ready' && selectedFile.url ? (
                <div>
                  <div className="bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      className="w-full h-48 object-contain"
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    >
                      <source src={selectedFile.url} type={selectedFile.type} />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>{selectedFile.type}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={togglePlayback}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 mr-1" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        {isPlaying ? 'Pause' : 'Lecture'}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (selectedFile.url) {
                            const a = document.createElement('a');
                            a.href = selectedFile.url;
                            a.download = selectedFile.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
                        }}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleProcessVideo}
                      disabled={isLoading}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Envoi en cours...' : 'Envoyer au serveur'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFile 
                      ? 'Vidéo en cours de traitement...'
                      : 'Sélectionnez une vidéo pour la lire'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations sur le service */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          À propos du service vidéo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">Formats supportés :</h4>
            <ul className="space-y-1">
              <li>• MP4, AVI, MOV</li>
              <li>• WMV, FLV, MKV</li>
              <li>• Taille max : 2GB</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Fonctionnalités :</h4>
            <ul className="space-y-1">
              <li>• Upload multiple</li>
              <li>• Lecteur intégré</li>
              <li>• Partage facile</li>
              <li>• Traitement automatique</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Qualité :</h4>
            <ul className="space-y-1">
              <li>• Résolution jusqu'à 4K</li>
              <li>• Compression optimisée</li>
              <li>• Streaming adaptatif</li>
              <li>• Prévisualisation rapide</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoServicePage;

