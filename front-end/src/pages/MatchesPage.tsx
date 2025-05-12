import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '@services/api';
import type { IUser, IProfile } from '@services/api';

interface IAMatch {
  user: IUser;
  profile: IProfile | null;
  match_score: number;
  score_details: {
    disc_score: number;
    interests_score: number;
    content_score: number;
    objectives_score: number;
  };
  match_reason: string;
}

const MatchCard: React.FC<{ match: IAMatch }> = ({ match }) => {
  const profileImageUrl = match.profile?.profile_picture_url || 'https://via.placeholder.com/150';
  const userFullName = match.user.full_name || match.user.email;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 transition-transform hover:scale-105">
      <div className="flex items-center mb-4">
        <img
          src={profileImageUrl}
          alt={`Profil de ${userFullName}`}
          className="w-20 h-20 rounded-full mr-4 object-cover"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600">
            <Link to={`/user/${match.user.id}`}>{userFullName}</Link>
          </h3>
          {match.profile?.disc_type && (
            <p className="text-sm text-blue-500">Profil DISC : {match.profile.disc_type}</p>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-1">
        Score de compatibilité :
        <span className={`font-bold ml-1 ${match.match_score > 0.7 ? 'text-green-600' : match.match_score > 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
          {(match.match_score * 100).toFixed(0)}%
        </span>
      </p>

      {match.profile?.bio && (
        <p className="text-gray-700 mb-2 italic line-clamp-2">Bio : {match.profile.bio}</p>
      )}

      {match.profile?.interests?.length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold text-sm text-gray-700">Intérêts communs :</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {match.profile.interests.slice(0, 5).map((interest: string, idx: number) => (
              <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      <details className="mb-2 text-sm">
        <summary className="cursor-pointer text-blue-600 hover:underline">Détails du score</summary>
        <ul className="mt-2 list-disc list-inside bg-gray-50 p-3 rounded">
          <li>DISC : {(match.score_details.disc_score * 100).toFixed(0)}%</li>
          <li>Intérêts : {(match.score_details.interests_score * 100).toFixed(0)}%</li>
          <li>Contenu Pods : {(match.score_details.content_score * 100).toFixed(0)}%</li>
          <li>Objectifs : {(match.score_details.objectives_score * 100).toFixed(0)}%</li>
        </ul>
      </details>

      <p className="text-xs text-gray-500 mb-4">{match.match_reason}</p>

      <Link
        to={`/user/${match.user.id}`}
        className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 text-center rounded"
      >
        Voir le profil
      </Link>
    </div>
  );
};

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<IAMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Veuillez vous connecter pour voir vos matchs.");
      setLoading(false);
      return;
    }

    const loadMatches = async () => {
      try {
        const fetchedMatches = await aiService.getMatches(10);
        setMatches(fetchedMatches);
      } catch (err) {
        console.error("Erreur lors de la récupération des matchs IA:", err);
        setError("Impossible de charger les recommandations pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement des recommandations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Erreur</h1>
        <p className="text-lg">{error}</p>
        {!isAuthenticated && (
          <Link to="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Se connecter
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-10 text-center">Vos Recommandations Personnalisées</h1>

        {matches.length === 0 ? (
          <div className="text-center bg-white p-8 rounded shadow-md">
            <p className="text-xl text-gray-600">Aucune recommandation pour le moment.</p>
          </div>
        ) : (
          matches.map((match, idx) => <MatchCard key={idx} match={match} />)
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
