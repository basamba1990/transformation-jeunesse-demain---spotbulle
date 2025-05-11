import React, { useState, useEffect, useContext } from 'react';
import { 
    getDISCQuestionnaire, 
    submitDISCAssessment, 
    getMyDISCResults, 
    DISCQuestion, 
    DISCAssessmentRequest, 
    DISCResultsResponse 
} from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

interface Answer {
    question_id: number;
    answer: number; // 1 à 4
}

const DISCOnboardingComponent: React.FC = () => {
    const [questions, setQuestions] = useState<DISCQuestion[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [discResults, setDiscResults] = useState<DISCResultsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);

    const auth = useContext(AuthContext);

    // Récupérer les résultats si déjà faits
    useEffect(() => {
        const fetchExistingResults = async () => {
            if (!auth?.isAuthenticated) return;

            setIsLoading(true);
            try {
                const result = await getMyDISCResults();
                if (result && result.disc_type !== "Indéterminé") {
                    setDiscResults(result);
                    setShowQuestionnaire(false);
                } else {
                    setShowQuestionnaire(true);
                }
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setShowQuestionnaire(true); // Aucun résultat existant
                } else {
                    setError("Erreur lors de la récupération des résultats.");
                }
            }
            setIsLoading(false);
        };
        fetchExistingResults();
    }, [auth?.isAuthenticated]);

    // Récupérer les questions si nécessaire
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!showQuestionnaire || !auth?.isAuthenticated) return;

            setIsLoading(true);
            try {
                const fetched = await getDISCQuestionnaire();
                setQuestions(fetched);
                setAnswers(fetched.map(q => ({ question_id: q.id, answer: 0 })));
            } catch {
                setError("Impossible de charger le questionnaire.");
            }
            setIsLoading(false);
        };
        fetchQuestions();
    }, [showQuestionnaire, auth?.isAuthenticated]);

    const handleAnswerChange = (questionId: number, value: number) => {
        setAnswers(prev => 
            prev.map(ans => ans.question_id === questionId ? { ...ans, answer: value } : ans)
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

        try {
            const data: DISCAssessmentRequest = { answers };
            const results = await submitDISCAssessment(data);
            setDiscResults(results);
            setShowQuestionnaire(false);
        } catch {
            setError("Erreur lors de la soumission.");
        }
        setIsLoading(false);
    };

    if (!auth?.isAuthenticated) {
        return <p className="text-center text-red-500">Veuillez vous connecter pour accéder à l’évaluation DISC.</p>;
    }

    if (isLoading) {
        return <p className="text-center">Chargement...</p>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>Erreur : {error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                >
                    Recharger
                </button>
            </div>
        );
    }

    if (discResults && !showQuestionnaire) {
        return (
            <div className="container mx-auto max-w-2xl p-4 bg-white shadow rounded">
                <h2 className="text-2xl font-bold text-center mb-4">Vos Résultats DISC</h2>
                <p className="text-lg font-semibold">Profil : <span className="text-purple-600">{discResults.disc_type}</span></p>
                <ul className="mt-4 list-disc list-inside">
                    <li>Dominance (D) : {discResults.scores.D.toFixed(2)}</li>
                    <li>Influence (I) : {discResults.scores.I.toFixed(2)}</li>
                    <li>Stabilité (S) : {discResults.scores.S.toFixed(2)}</li>
                    <li>Conformité (C) : {discResults.scores.C.toFixed(2)}</li>
                </ul>
                <button 
                    onClick={() => { setShowQuestionnaire(true); setDiscResults(null); }} 
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Repasser le test
                </button>
            </div>
        );
    }

    if (showQuestionnaire && questions.length > 0) {
        return (
            <div className="container mx-auto max-w-2xl p-4">
                <h2 className="text-2xl font-bold text-center mb-6">Questionnaire DISC</h2>
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {questions.map((q, index) => (
                        <div key={q.id} className="mb-6">
                            <p className="text-gray-700 font-semibold mb-2">{index + 1}. {q.text}</p>
                            <div className="flex flex-wrap justify-around">
                                {[1, 2, 3, 4].map(value => (
                                    <label key={value} className="mr-4 mb-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`question-${q.id}`} 
                                            value={value} 
                                            checked={answers.find(ans => ans.question_id === q.id)?.answer === value}
                                            onChange={() => handleAnswerChange(q.id, value)} 
                                            className="mr-1"
                                        /> 
                                        {value === 1 ? "Pas du tout" : value === 2 ? "Un peu" : value === 3 ? "Assez" : "Tout à fait"}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                    >
                        Soumettre mes réponses
                    </button>
                </form>
            </div>
        );
    }

    return <p className="text-center">Préparation du test DISC...</p>;
};

export default DISCOnboardingComponent;
