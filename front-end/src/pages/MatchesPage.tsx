import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIAMatches, IAMatch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // Pour s'assurer que l'utilisateur est connecté

const MatchCard: React.FC<{ match: IAMatch }> = ({ match }) => {
    const profileImageUrl = match.profile?.profile_picture_url || 'https://via.placeholder.com/150';
    const userFullName = match.user.full_name || match.user.email;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 transform transition duration-500 hover:scale-105">
            <div className="flex items-center mb-4">
                <img 
                    src={profileImageUrl} 
                    alt={`Profil de ${userFullName}`}
                    className="w-20 h-20 rounded-full mr-4 object-cover"
                />
                <div>
                    <h3 className="text-2xl font-semibold text-gray-800 hover:text-blue-600">
                        <Link to={`/user/${match.user.id}`}>{userFullName}</Link>
                    </h3>
                    {match.profile?.disc_type && (
                        <p className="text-sm text-blue-500">Profil DISC: {match.profile.disc_type}</p>
                    )}
                </div>
            </div>
            
            <p className="text-gray-600 mb-1">Score de compatibilité: 
                <span className={`font-bold ${match.match_score > 0.7 ? 'text-green-500' : match.match_score > 0.4 ? 'text-yellow-500' : 'text-red-500'}">
                    {(match.match_score * 100).toFixed(0)}%
                </span>
            </p>
            
            {match.profile?.bio && (
                <p className="text-gray-700 mb-3 italic line-clamp-2">Bio: {match.profile.bio}</p>
            )}

            {match.profile?.interests && match.profile.interests.length > 0 && (
                <div className="mb-3">
                    <h4 className="font-semibold text-gray-700 text-sm">Intérêts communs potentiels:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {match.profile.interests.slice(0, 5).map(interest => (
                            <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <details className="mb-4 text-sm">
                <summary className="cursor-pointer text-blue-600 hover:underline">Détails du score</summary>
                <ul className="mt-2 list-disc list-inside bg-gray-50 p-3 rounded">
                    <li>DISC: {(match.score_details.disc_score * 100).toFixed(0)}%</li>
                    <li>Intérêts: {(match.score_details.interests_score * 100).toFixed(0)}%</li>
                    <li>Contenu Pods: {(match.score_details.content_score * 100).toFixed(0)}%</li>
                    <li>Objectifs: {(match.score_details.objectives_score * 100).toFixed(0)}%</li>
                </ul>
            </details>

            <p className="text-xs text-gray-500 mb-4">{match.match_reason}</p>

            <Link 
                to={`/user/${match.user.id}`} 
                className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 block"
            >
                Voir le profil
            </Link>
        </div>
    );
};

const MatchesPage: React.FC = () => {
    const [matches, setMatches] = useState<IAMatch[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth(); // Vérifier l'authentification

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            setError("Veuillez vous connecter pour voir vos matchs.");
            return;
        }

        const loadMatches = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedMatches = await fetchIAMatches(10, false); // Limite à 10, utilise SBERT par défaut
                setMatches(fetchedMatches);
            } catch (err) {
                console.error("Erreur lors de la récupération des matchs IA:", err);
                setError("Impossible de charger les recommandations pour le moment. Veuillez réessayer plus tard.");
            }
            setLoading(false);
        };

        loadMatches();
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Recherche de profils compatibles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-red-500 mb-6">Erreur</h1>
                <p className="text-xl text-gray-700">{error}</p>
                { !isAuthenticated && <Link to="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Se connecter</Link> }
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-5xl font-extrabold text-white mb-10 text-center shadow-sm">
                    Vos Recommandations Personnalisées
                </h1>
                
                {matches.length === 0 && !loading && (
                    <div className="text-center bg-white p-10 rounded-lg shadow-xl">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-2xl font-medium text-gray-900">Aucune recommandation pour le moment.</h3>
                        <p className="mt-1 text-gray-600">
                            Complétez votre profil DISC et ajoutez des pods pour obtenir des suggestions plus pertinentes.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/profile"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Compléter mon profil
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {matches.map((match) => (
                        <MatchCard key={match.user.id} match={match} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchesPage;

