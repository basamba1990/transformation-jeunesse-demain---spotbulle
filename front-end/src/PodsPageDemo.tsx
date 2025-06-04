import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic2, Play, Pause, FileText, Video, MessageSquare } from 'lucide-react';

// Données de démonstration
const demoPods = [
  {
    id: 1,
    title: "Ma transformation personnelle",
    description: "Partage de mon parcours de développement personnel et des leçons apprises.",
    audio_file_url: "/assets/audio/samples_jfk.mp3",
    transcription: "Bonjour, je souhaite partager avec vous mon parcours de transformation personnelle. Au cours des dernières années, j'ai appris l'importance de l'écoute de soi et de la connexion avec les autres...",
    created_at: "2025-01-15T10:30:00Z",
    user_name: "Sophie Martin",
    tags: ["développement", "personnel", "transformation"]
  },
  {
    id: 2,
    title: "Conseils pour entrepreneurs",
    description: "Mes conseils pratiques pour les entrepreneurs qui débutent leur aventure.",
    audio_file_url: "/assets/audio/EconomicModel.wav",
    transcription: "Être entrepreneur, c'est avant tout avoir le courage de prendre des risques calculés. Dans ce pod, je partage mes expériences et mes conseils pour réussir...",
    created_at: "2025-01-14T15:45:00Z",
    user_name: "Thomas Dubois",
    tags: ["entrepreneuriat", "business", "conseils"]
  },
  {
    id: 3,
    title: "L'art de la méditation",
    description: "Introduction à la méditation et ses bienfaits dans la vie quotidienne.",
    audio_file_url: "/assets/audio/samples_jfk.mp3",
    transcription: null,
    created_at: "2025-01-13T08:20:00Z",
    user_name: "Marie Dubois",
    tags: ["méditation", "bien-être", "spiritualité"]
  },
  {
    id: 4,
    title: "Innovation technologique",
    description: "Discussion sur les dernières tendances en intelligence artificielle et leur impact.",
    audio_file_url: "/assets/audio/EconomicModel.wav",
    transcription: "L'intelligence artificielle transforme notre monde à une vitesse impressionnante. Dans ce pod, j'explore les opportunités et les défis que cela représente...",
    created_at: "2025-01-12T14:10:00Z",
    user_name: "Alex Chen",
    tags: ["technologie", "IA", "innovation"]
  }
];

const PodsPageDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  const [playingPod, setPlayingPod] = useState<number | null>(null);
  const [selectedPod, setSelectedPod] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

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

  const handlePlayPause = (podId: number, audioUrl: string) => {
    if (playingPod === podId) {
      setPlayingPod(null);
    } else {
      setPlayingPod(podId);
      // Ici on pourrait implémenter la lecture audio réelle
    }
  };

  const handlePodClick = (pod: any) => {
    setSelectedPod(pod);
    setShowDetail(true);
  };

  const displayPods = viewMode === "all" ? demoPods : demoPods.slice(0, 2); // Simuler "mes pods"

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header avec notification démo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full mr-3">
            <Mic2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-blue-800 dark:text-blue-200 font-medium">Mode Démonstration</h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              Voici un aperçu des fonctionnalités de pods audio. Connectez-vous pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
          {viewMode === "all" ? "Explorer les Pods Audio" : "Mes Pods Audio"}
        </h1>
        
        <Link 
          to="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <Mic2 className="h-4 w-4 mr-2" />
          Créer un Pod
        </Link>
      </div>

      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={() => setViewMode("all")}
          className={`py-2 px-4 rounded-full font-medium transition-colors ${
            viewMode === "all" 
              ? "bg-blue-500 text-white shadow-md" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Tous les Pods ({demoPods.length})
        </button>
        <button
          onClick={() => setViewMode("mine")}
          className={`py-2 px-4 rounded-full font-medium transition-colors ${
            viewMode === "mine" 
              ? "bg-blue-500 text-white shadow-md" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Mes Pods (2)
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPods.map(pod => (
          <div 
            key={pod.id} 
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handlePodClick(pod)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">{pod.title}</h2>
                {pod.transcription && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                    Transcrit
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
                {pod.description}
              </p>
              
              <div className="flex items-center mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(pod.id, pod.audio_file_url);
                  }}
                  className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 p-2 rounded-full mr-3 transition-colors"
                >
                  {playingPod === pod.id ? (
                    <Pause className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: playingPod === pod.id ? '45%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {pod.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{pod.user_name}</span>
                <span>{formatDate(pod.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail */}
      {showDetail && selectedPod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedPod.title}</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedPod.description}</p>
              
              <div className="mb-4">
                <audio 
                  controls 
                  src={selectedPod.audio_file_url} 
                  className="w-full"
                >
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
              </div>
              
              {selectedPod.transcription && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Transcription
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                      {selectedPod.transcription}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPod.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Par {selectedPod.user_name}</span>
                  <span>{formatDate(selectedPod.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions flottantes */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <Link
          to="/login"
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Service Transcription"
        >
          <FileText className="h-6 w-6" />
        </Link>
        <Link
          to="/login"
          className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Service Vidéo"
        >
          <Video className="h-6 w-6" />
        </Link>
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Créer un Pod"
        >
          <Mic2 className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
};

export default PodsPageDemo;

