import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Users, Heart, MessageCircle, Filter, Search, RefreshCw } from "lucide-react";

interface Match {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
    bio?: string;
    interests?: string;
  };
  compatibility_score: number;
  match_reason: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'declined';
}

const MatchesPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Données de démonstration pour les matches
  const demoMatches: Match[] = [
    {
      id: 1,
      user: {
        id: 2,
        full_name: "Marie Dubois",
        email: "marie.dubois@example.com",
        bio: "Passionnée de développement personnel et de leadership",
        interests: "Leadership, Communication, Entrepreneuriat"
      },
      compatibility_score: 92,
      match_reason: "Intérêts communs en développement personnel et leadership",
      created_at: "2025-06-07T10:00:00Z",
      status: "pending"
    },
    {
      id: 2,
      user: {
        id: 3,
        full_name: "Jean Martin",
        email: "jean.martin@example.com",
        bio: "Coach en transformation personnelle",
        interests: "Coaching, Méditation, Croissance personnelle"
      },
      compatibility_score: 87,
      match_reason: "Profils complémentaires en coaching et développement",
      created_at: "2025-06-06T15:30:00Z",
      status: "accepted"
    },
    {
      id: 3,
      user: {
        id: 4,
        full_name: "Sophie Laurent",
        email: "sophie.laurent@example.com",
        bio: "Experte en communication et relations humaines",
        interests: "Communication, Relations humaines, Formation"
      },
      compatibility_score: 84,
      match_reason: "Expertise complémentaire en communication",
      created_at: "2025-06-05T09:15:00Z",
      status: "pending"
    }
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMatches();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterMatches();
  }, [matches, searchTerm, statusFilter]);

  const loadMatches = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En production, remplacer par un vrai appel API
      // const response = await matchService.getMatches();
      // setMatches(response.data);
      
      setMatches(demoMatches);
    } catch (error) {
      console.error("Erreur lors du chargement des matches:", error);
      setError("Erreur lors du chargement des matches");
      // En cas d'erreur, utiliser les données de démo
      setMatches(demoMatches);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(match =>
        match.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.user.interests?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.match_reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(match => match.status === statusFilter);
    }

    setFilteredMatches(filtered);
  };

  const handleMatchAction = async (matchId: number, action: 'accept' | 'decline') => {
    try {
      // Simulation d'un appel API
      console.log(`Action ${action} pour le match ${matchId}`);
      
      // Mettre à jour le statut local
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, status: action === 'accept' ? 'accepted' : 'declined' }
          : match
      ));
    } catch (error) {
      console.error("Erreur lors de l'action sur le match:", error);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepté';
      case 'declined':
        return 'Refusé';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vos Matches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les personnes qui partagent vos centres d'intérêt et objectifs
          </p>
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
                  placeholder="Rechercher par nom, intérêts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Acceptés</option>
                <option value="declined">Refusés</option>
              </select>
            </div>

            {/* Bouton actualiser */}
            <button
              onClick={loadMatches}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des matches */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement de vos matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {matches.length === 0 ? "Aucun match trouvé" : "Aucun résultat"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {matches.length === 0 
                ? "Nous recherchons des personnes compatibles avec votre profil..."
                : "Essayez de modifier vos critères de recherche"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {/* En-tête du match */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {match.user.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {match.user.full_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {match.compatibility_score}% compatible
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                    {getStatusText(match.status)}
                  </span>
                </div>

                {/* Bio */}
                {match.user.bio && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {match.user.bio}
                  </p>
                )}

                {/* Intérêts */}
                {match.user.interests && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Centres d'intérêt
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {match.user.interests}
                    </p>
                  </div>
                )}

                {/* Raison du match */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Pourquoi ce match ?
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {match.match_reason}
                  </p>
                </div>

                {/* Actions */}
                {match.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMatchAction(match.id, 'accept')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleMatchAction(match.id, 'decline')}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Refuser
                    </button>
                  </div>
                )}

                {match.status === 'accepted' && (
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Démarrer une conversation</span>
                  </button>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Match du {new Date(match.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {matches.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Statistiques de vos matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{matches.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {matches.filter(m => m.status === 'accepted').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acceptés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {matches.filter(m => m.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(matches.reduce((acc, m) => acc + m.compatibility_score, 0) / matches.length)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compatibilité moyenne</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;

