import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
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
  MessageCircle
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
  const { user, isAuthenticated, loading } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [filteredPods, setFilteredPods] = useState<Pod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  // Données de démonstration pour les pods
  const demoPods: Pod[] = [
    {
      id: 1,
      title: "Transformation Jeunesse",
      description: "Comment SpotBulle accompagne la transformation de la jeunesse vers un avenir prometteur",
      audio_url: "/audio/transformation-jeunesse.mp3",
      duration: 180,
      created_at: "2025-06-01T10:00:00Z",
      author: "SpotBulle Team",
      plays: 1250,
      likes: 89,
      category: "Développement"
    },
    {
      id: 2,
      title: "Développement Personnel",
      description: "Techniques et conseils pratiques pour votre développement personnel et professionnel",
      audio_url: "/audio/developpement-personnel.mp3",
      duration: 240,
      created_at: "2025-06-02T14:30:00Z",
      author: "Expert Coach",
      plays: 980,
      likes: 67,
      category: "Coaching"
    },
    {
      id: 3,
      title: "Méditation Guidée",
      description: "Une séance de méditation guidée pour la concentration et la paix intérieure",
      audio_url: "/audio/meditation-guidee.mp3",
      duration: 300,
      created_at: "2025-06-03T09:15:00Z",
      author: "Maître Zen",
      plays: 1500,
      likes: 120,
      category: "Bien-être"
    },
    {
      id: 4,
      title: "Leadership Inspirant",
      description: "Les clés d'un leadership authentique et inspirant pour transformer votre équipe",
      audio_url: "/audio/leadership-inspirant.mp3",
      duration: 210,
      created_at: "2025-06-04T16:45:00Z",
      author: "CEO Mentor",
      plays: 750,
      likes: 45,
      category: "Leadership"
    },
    {
      id: 5,
      title: "Motivation Quotidienne",
      description: "Boostez votre motivation avec ces conseils pratiques pour rester motivé au quotidien",
      audio_url: "/audio/motivation-quotidienne.mp3",
      duration: 150,
      created_at: "2025-06-05T08:00:00Z",
      author: "Coach Motivation",
      plays: 2100,
      likes: 156,
      category: "Motivation"
    }
  ];

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
        podsData = await podService.getUserPods();
      }
      
      // Utiliser les données de démo si l'API échoue
      if (!podsData || podsData.length === 0) {
        console.log('🎭 Utilisation des données de démo');
        podsData = activeTab === "all" ? demoPods : demoPods.slice(0, 2);
      }
      
      setPods(podsData);
      console.log('✅ Pods chargés:', podsData.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pods:', error);
      setError("Erreur lors du chargement des pods");
      
      // Utiliser les données de démo en cas d'erreur
      setPods(activeTab === "all" ? demoPods : demoPods.slice(0, 2));
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

  const togglePlayPause = (podId: number) => {
    if (currentlyPlaying === podId) {
      setCurrentlyPlaying(null);
      console.log('⏸️ Pause du pod:', podId);
    } else {
      setCurrentlyPlaying(podId);
      console.log('▶️ Lecture du pod:', podId);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategories = () => {
    const categories = Array.from(new Set(pods.map(pod => pod.category).filter(Boolean)));
    return categories;
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirection si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explorer les Pods Audio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez notre collection de ressources audio pour vous accompagner dans votre parcours de transformation
          </p>
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
                Tous les Pods
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "my"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Mes Pods
              </button>
            </nav>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, description, auteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Filtre par catégorie */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Toutes les catégories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Bouton actualiser */}
            <button
              onClick={loadPods}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>

            {/* Bouton créer un pod */}
            {activeTab === "my" && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Créer un Pod</span>
              </button>
            )}
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des pods */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des pods...</p>
          </div>
        ) : filteredPods.length === 0 ? (
          <div className="text-center py-12">
            <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {pods.length === 0 ? "Aucun pod disponible" : "Aucun résultat"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {pods.length === 0 
                ? "Commencez par créer votre premier pod audio"
                : "Essayez de modifier vos critères de recherche"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPods.map((pod) => (
              <div key={pod.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Image/Placeholder du pod */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Volume2 className="w-16 h-16 text-white opacity-80" />
                </div>

                {/* Contenu du pod */}
                <div className="p-6">
                  {/* En-tête */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {pod.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {pod.description}
                    </p>
                  </div>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{pod.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(pod.duration)}</span>
                    </div>
                  </div>

                  {/* Catégorie */}
                  {pod.category && (
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-full">
                        {pod.category}
                      </span>
                    </div>
                  )}

                  {/* Contrôles de lecture */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => togglePlayPause(pod.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {currentlyPlaying === pod.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{currentlyPlaying === pod.id ? "Pause" : "Écouter"}</span>
                    </button>

                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Statistiques */}
                  {(pod.plays || pod.likes) && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      {pod.plays && (
                        <span>{pod.plays.toLocaleString()} écoutes</span>
                      )}
                      {pod.likes && (
                        <span>{pod.likes} j'aime</span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Publié le {formatDate(pod.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {pods.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Statistiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{pods.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === "all" ? "Pods disponibles" : "Mes pods"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(pods.reduce((acc, pod) => acc + pod.duration, 0) / 60)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Minutes de contenu</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {getCategories().length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Catégories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {pods.reduce((acc, pod) => acc + (pod.plays || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total écoutes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodsPage;

