// frontend/src/profile/DISCOnboardingComponent.tsx
import React, { useState, useEffect, useContext } from 'react';
import { getDISCQuestionnaire, submitDISCAssessment, DISCQuestion, DISCAssessmentRequest, DISCResultsResponse, getMyDISCResults } from '../services/api';
import { AuthContext } from '../contexts/AuthContext'; // Pour s'assurer que l'utilisateur est connecté

interface Answer {
    question_id: number;
    answer: number; // 1 (Pas du tout) à 4 (Tout à fait)
}

const DISCOnboardingComponent: React.FC = () => {
    const [questions, setQuestions] = useState<DISCQuestion[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [discResults, setDiscResults] = useState<DISCResultsResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false);

    const auth = useContext(AuthContext);

    useEffect(() => {
        // Charger les résultats existants si l'utilisateur a déjà passé le test
        const fetchExistingResults = async () => {
            if (!auth?.isAuthenticated) return;
            setIsLoading(true);
            try {
                const existingResults = await getMyDISCResults();
                if (existingResults && existingResults.disc_type !== "Indéterminé") {
                    setDiscResults(existingResults);
                    setShowQuestionnaire(false); // Ne pas montrer le questionnaire si résultats existent
                }
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    // Pas de résultats existants, c'est normal, on peut afficher le questionnaire
                    setShowQuestionnaire(true);
                } else {
                    console.error("Erreur lors de la récupération des résultats DISC existants:", err);
                    setError("Impossible de charger les résultats DISC existants.");
                }
            }
            setIsLoading(false);
        };

        fetchExistingResults();
    }, [auth?.isAuthenticated]);

    useEffect(() => {
        // Charger le questionnaire si nécessaire
        if (showQuestionnaire && auth?.isAuthenticated) {
            const fetchQuestions = async () => {
                setIsLoading(true);
                try {
                    const fetchedQuestions = await getDISCQuestionnaire();
                    setQuestions(fetchedQuestions);
                    // Initialiser les réponses
                    setAnswers(fetchedQuestions.map(q => ({ question_id: q.id, answer: 0 }))); // 0 pour non répondu
                    setError(null);
                } catch (err) {
                    console.error("Erreur lors du chargement du questionnaire DISC:", err);
                    setError("Impossible de charger le questionnaire DISC.");
                }
                setIsLoading(false);
            };
            fetchQuestions();
        }
    }, [showQuestionnaire, auth?.isAuthenticated]);

    const handleAnswerChange = (questionId: number, value: number) => {
        setAnswers(prevAnswers => 
            prevAnswers.map(ans => 
                ans.question_id === questionId ? { ...ans, answer: value } : ans
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (answers.some(ans => ans.answer === 0)) {
            setError("Veuillez répondre à toutes les questions.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setDiscResults(null);

        const assessmentData: DISCAssessmentRequest = { answers };

        try {
            const results = await submitDISCAssessment(assessmentData);
            setDiscResults(results);
            setShowQuestionnaire(false); // Cacher le questionnaire après soumission
        } catch (err) {
            console.error("Erreur lors de la soumission de l'évaluation DISC:", err);
            setError("Une erreur est survenue lors de la soumission de vos réponses.");
        }
        setIsLoading(false);
    };

    if (!auth?.isAuthenticated) {
        return <p className="text-center text-red-500">Veuillez vous connecter pour accéder à l'évaluation DISC.</p>;
    }

    if (isLoading) {
        return <p className="text-center">Chargement...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Erreur: {error}</p>;
    }

    if (discResults && !showQuestionnaire) {
        return (
            <div className="container mx-auto p-4 max-w-2xl bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold text-center my-6">Vos Résultats DISC</h2>
                <p className="text-lg font-semibold">Votre profil principal : <span className="text-purple-600">{discResults.disc_type}</span></p>
                <div className="my-4">
                    <h3 className="font-semibold">Scores Détaillés :</h3>
                    <ul className="list-disc list-inside">
                        <li>Dominance (D): {discResults.scores.D.toFixed(2)}</li>
                        <li>Influence (I): {discResults.scores.I.toFixed(2)}</li>
                        <li>Stabilité (S): {discResults.scores.S.toFixed(2)}</li>
                        <li>Conformité (C): {discResults.scores.C.toFixed(2)}</li>
                    </ul>
                </div>
                {/* Ici, on pourrait ajouter des graphiques ou des descriptions plus détaillées des types */} 
                <button 
                    onClick={() => { setShowQuestionnaire(true); setDiscResults(null); setError(null); }} 
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Repasser le test
                </button>
            </div>
        );
    }

    if (showQuestionnaire && questions.length > 0) {
        return (
            <div className="container mx-auto p-4 max-w-2xl">
                <h2 className="text-2xl font-bold text-center my-6">Questionnaire d'Évaluation DISC</h2>
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {questions.map((q, index) => (
                        <div key={q.id} className="mb-6">
                            <p className="block text-gray-700 text-sm font-bold mb-2">{index + 1}. {q.text}</p>
                            <div className="flex flex-col sm:flex-row justify-around mt-2">
                                {[1, 2, 3, 4].map(value => (
                                    <label key={value} className="mb-2 sm:mb-0 sm:mr-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`question-${q.id}`} 
                                            value={value} 
                                            checked={answers.find(ans => ans.question_id === q.id)?.answer === value}
                                            onChange={() => handleAnswerChange(q.id, value)} 
                                            className="mr-1"
                                            required
                                        /> 
                                        {value === 1 ? "Pas du tout" : value === 2 ? "Un peu" : value === 3 ? "Assez" : "Tout à fait"}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button 
                        type="submit" 
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Évaluation en cours...' : 'Soumettre mes réponses'}
                    </button>
                </form>
            </div>
        );
    }
    
    // Cas où le questionnaire n'est pas encore chargé ou aucun résultat existant et showQuestionnaire est false
    return <p className="text-center">Préparation de l'évaluation DISC...</p>; 
};

export default DISCOnboardingComponent;

