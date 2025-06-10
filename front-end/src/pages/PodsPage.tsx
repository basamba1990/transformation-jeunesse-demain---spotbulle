import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { podService } from "../services/api";
import { 
  Play, 
  Pause, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  User,
  Volume2,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Mic,
  Upload,
  Eye,
  Trash2
} from "lucide-react";

interface Pod {
  id: number;
  title: string;
  description: string;
  audio_url: string;
  duration: number;
  created_at: string;
  author: string;
  plays?: number;
  likes?: number;
  category?: string;
}

const PodsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [filteredPods, setFilteredPods] = useState<Pod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPods();
    }
  }, [isAuthenticated, user, activeTab]);

  useEffect(() => {
    filterPods();
  }, [pods, searchTerm, categoryFilter]);

  const loadPods = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log('🎵 Chargement des pods...');
      
      let podsData;
      if (activeTab === "all") {
        podsData = await podService.fetchAll();
      } else {
        // Pour "my", on peut filtrer les pods de l'utilisateur ou utiliser un service dédié
        podsData = await podService.fetchAll();
        podsData = podsData.filter((pod: Pod) => pod.author === user?.full_name);
      }
      
      setPods(podsData);
      console.log('✅ Pods chargés:', podsData.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pods:', error);
      setError("Impossible de charger les pods. Veuillez réessayer.");
      setPods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPods = () => {
    let filtered = pods;
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(pod =>
        pod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pod.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrer par catégorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter(pod => pod.category === categoryFilter);
    }
    
    setFilteredPods(filtered);
  };

  const togglePlay = (podId: number) => {
    if (currentlyPlaying === podId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(podId);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategories = () => {
    const categories = Array.from(new Set(pods.map(pod => pod.category).filter(Boolean)));
    return ["all", ...categories];
  };

  const handleCreatePod = () => {
    setShowCreateModal(true);
  };

  const handleDeletePod = async (podId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pod ?')) {
      try {
        await podService.delete(podId);
        setPods(pods.filter(pod => pod.id !== podId));
        console.log('✅ Pod supprimé');
      } catch (error) {
        console.error('❌ Erreur suppression pod:', error);
        setError("Erreur lors de la suppression du pod");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mes Pods Audio
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Découvrez et gérez vos enregistrements audio
              </p>
            </div>
            <button
              onClick={handleCreatePod}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un Pod
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Mic className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pods</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pods.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Écoutes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pods.reduce((total, pod) => total + (pod.plays || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pods.reduce((total, pod) => total + (pod.likes || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Durée Totale</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(pods.reduce((total, pod) => total + pod.duration, 0) / 60)}min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Tous les pods
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "my"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Mes pods
              </button>
            </nav>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un pod..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Filtre par catégorie */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Toutes les catégories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Bouton de rafraîchissement */}
            <button
              onClick={loadPods}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des pods */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des pods...</p>
          </div>
        ) : filteredPods.length === 0 ? (
          <div className="text-center py-12">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun pod trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier pod audio'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPods.map((pod) => (
              <div key={pod.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mr-3">
                          {pod.title}
                        </h3>
                        {pod.category && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {pod.category}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {pod.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 mb-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {pod.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(pod.duration)}
                        </div>
                        {pod.plays && (
                          <div className="flex items-center">
                            <Play className="w-4 h-4 mr-1" />
                            {pod.plays} écoutes
                          </div>
                        )}
                        {pod.likes && (
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {pod.likes} likes
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400">
                        Publié le {formatDate(pod.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() => togglePlay(pod.id)}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      >
                        {currentlyPlaying === pod.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>

                      {activeTab === "my" && (
                        <button 
                          onClick={() => handleDeletePod(pod.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Lecteur audio (affiché si en cours de lecture) */}
                  {currentlyPlaying === pod.id && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <audio
                        controls
                        className="w-full"
                        autoPlay
                        onEnded={() => setCurrentlyPlaying(null)}
                      >
                        <source src={pod.audio_url} type="audio/mpeg" />
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création de pod */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Créer un nouveau pod
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Fonctionnalité en cours de développement. Vous pourrez bientôt enregistrer et uploader vos pods audio directement depuis cette interface.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Fermer
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Bientôt disponible
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodsPage;

