import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { matchService } from "../services/api";
import { Users, User, ChevronRight, Award, Zap, Heart, Target } from "lucide-react";
import Alert from "../components/Alert";
import { logError } from "../utils/debug";

interface MatchUser {
  id: number;
  email: string;
  full_name: string;
}

interface MatchProfile {
  bio: string | null;
  disc_type: string | null;
  interests: string[];
}

interface MatchScoreDetails {
  disc_score: number;
  interests_score: number;
  content_score: number;
  objectives_score: number;
}

interface Match {
  user: MatchUser;
  profile: MatchProfile;
  match_score: number;
  score_details: MatchScoreDetails;
  match_reason: string;
}

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { isAuthenticated, isDemoMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Veuillez vous connecter pour voir vos matchs.");
      setLoading(false);
      return;
    }

    const loadMatches = async () => {
      try {
        const fetchedMatches = await matchService.getMatches(10);
        setMatches(fetchedMatches);
      } catch (err: any) {
        logError("Erreur lors de la récupération des matchs:", err);
        setError("Impossible de charger les recommandations pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [isAuthenticated, navigate]);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
  };

  const formatScorePercentage = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  // Afficher un message si l'utilisateur est en mode démo
  const renderDemoModeWarning = () => {
    if (isDemoMode) {
      return (
        <Alert 
          type="info" 
          message="Vous êtes en mode démonstration. Les données affichées sont fictives." 
        />
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {renderDemoModeWarning()}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 md:mb-0">
          Vos Matchs
        </h1>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary-300 dark:bg-primary-700 mb-3"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Chargement des matchs...</p>
          </div>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="bg-neutral-50 dark:bg-dark-border/20 rounded-xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-200 dark:bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Aucun match trouvé
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Complétez votre profil et ajoutez des pods pour obtenir des recommandations de personnes compatibles.
            </p>
            <button 
              onClick={() => navigate("/profile")}
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-full transition-colors shadow-md"
            >
              Compléter mon profil
            </button>
          </div>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-dark-surface shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${selectedMatch === match ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => handleMatchClick(match)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                      <User size={24} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                        {match.user.full_name}
                      </h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {match.profile.disc_type ? `Type DISC: ${match.profile.disc_type}` : "Profil DISC non défini"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold rounded-full h-10 w-10 flex items-center justify-center">
                      {formatScorePercentage(match.match_score)}
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Match</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm line-clamp-2">
                    {match.profile.bio || "Pas de bio disponible."}
                  </p>
                </div>
                
                {match.profile.interests && match.profile.interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Centres d'intérêt</p>
                    <div className="flex flex-wrap gap-1">
                      {match.profile.interests.slice(0, 3).map((interest, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300">
                          {interest}
                        </span>
                      ))}
                      {match.profile.interests.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300">
                          +{match.profile.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-neutral-200 dark:border-dark-border pt-3 mt-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Détails de compatibilité</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Award size={14} className="text-blue-500 mr-1" />
                      <span className="text-xs">DISC: {formatScorePercentage(match.score_details.disc_score)}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart size={14} className="text-red-500 mr-1" />
                      <span className="text-xs">Intérêts: {formatScorePercentage(match.score_details.interests_score)}</span>
                    </div>
                    <div className="flex items-center">
                      <Zap size={14} className="text-yellow-500 mr-1" />
                      <span className="text-xs">Contenu: {formatScorePercentage(match.score_details.content_score)}</span>
                    </div>
                    <div className="flex items-center">
                      <Target size={14} className="text-green-500 mr-1" />
                      <span className="text-xs">Objectifs: {formatScorePercentage(match.score_details.objectives_score)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button className="text-primary-600 dark:text-primary-400 text-sm flex items-center hover:underline">
                    Voir le profil <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-neutral-200 dark:border-dark-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Détails du match</h2>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                  <User size={32} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{selectedMatch.user.full_name}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">{selectedMatch.user.email}</p>
                  {selectedMatch.profile.disc_type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mt-1">
                      Type DISC: {selectedMatch.profile.disc_type}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Bio</h4>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {selectedMatch.profile.bio || "Pas de bio disponible."}
                </p>
              </div>
              
              {selectedMatch.profile.interests && selectedMatch.profile.interests.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Centres d'intérêt</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.profile.interests.map((interest, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Score de compatibilité</h4>
                <div className="bg-neutral-50 dark:bg-dark-border/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-neutral-700 dark:text-neutral-300">Score global</span>
                    <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold rounded-full px-3 py-1">
                      {formatScorePercentage(selectedMatch.match_score)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Compatibilité DISC</span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{formatScorePercentage(selectedMatch.score_details.disc_score)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: formatScorePercentage(selectedMatch.score_details.disc_score) }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Intérêts communs</span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{formatScorePercentage(selectedMatch.score_details.interests_score)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: formatScorePercentage(selectedMatch.score_details.interests_score) }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Compatibilité de contenu</span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{formatScorePercentage(selectedMatch.score_details.content_score)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: formatScorePercentage(selectedMatch.score_details.content_score) }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Alignement des objectifs</span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{formatScorePercentage(selectedMatch.score_details.objectives_score)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-dark-border rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: formatScorePercentage(selectedMatch.score_details.objectives_score) }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Raison du match</h4>
                <p className="text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-dark-border/20 p-4 rounded-lg">
                  {selectedMatch.match_reason}
                </p>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="bg-neutral-200 dark:bg-dark-border hover:bg-neutral-300 dark:hover:bg-dark-border/70 text-neutral-700 dark:text-neutral-300 font-medium py-2 px-4 rounded-md mr-2"
                >
                  Fermer
                </button>
                <button 
                  className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md"
                >
                  Contacter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;

