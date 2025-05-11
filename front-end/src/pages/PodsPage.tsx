import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchAllPods, fetchMyPods, deletePod as apiDeletePod, transcribePod as apiTranscribePod } from "../services/api";
import type { IPod } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PodsPage: React.FC = () => {
    const [pods, setPods] = useState<IPod[]>([]);
    const [myPods, setMyPods] = useState<IPod[]>([]);
    const [viewMode, setViewMode] = useState<"all" | "mine">("all");
    const [isLoading, setIsLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const loadPods = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (viewMode === "all") {
                const allPodsData = await fetchAllPods();
                setPods(allPodsData);
            } else if (user) {
                const myPodsData = await fetchMyPods();
                setMyPods(myPodsData);
            }
        } catch (err) {
            console.error("Error loading pods:", err);
            setError("Impossible de charger les pods. Veuillez réessayer.");
        }
        setIsLoading(false);
    }, [viewMode, user]);

    useEffect(() => {
        loadPods();
    }, [loadPods]);

    const handleDeletePod = async (podId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pod ?")) {
            return;
        }
        try {
            await apiDeletePod(podId);
            setPods(prev => prev.filter(p => p.id !== podId));
            setMyPods(prev => prev.filter(p => p.id !== podId));
            alert("Pod supprimé avec succès !");
        } catch (err) {
            console.error("Error deleting pod:", err);
            alert("Erreur lors de la suppression du pod.");
        }
    };

    const handleTranscribePod = async (podId: number) => {
        if (!window.confirm("Lancer la transcription pour ce pod ? Cela peut prendre un moment.")) {
            return;
        }
        setIsTranscribing(prev => ({ ...prev, [podId]: true }));
        setError(null);
        try {
            const updatedPod = await apiTranscribePod(podId);
            const updateList = (list: IPod[]) => list.map(p => p.id === podId ? updatedPod : p);
            setPods(updateList);
            setMyPods(updateList);
            alert("Transcription terminée et enregistrée !");
        } catch (err: any) {
            console.error(`Error transcribing pod ${podId}:`, err);
            setError(err.response?.data?.detail || err.message || "Erreur lors de la transcription du pod.");
        }
        setIsTranscribing(prev => ({ ...prev, [podId]: false }));
    };

    const displayPods = viewMode === "all" ? pods : myPods;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    {viewMode === "all" ? "Explorer les Pods Audio" : "Mes Pods Audio"}
                </h1>
                <div>
                    <Link to="/pods/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Créer un Pod
                    </Link>
                </div>
            </div>

            <div className="mb-6 flex justify-center space-x-4">
                <button
                    onClick={() => setViewMode("all")}
                    className={`py-2 px-4 rounded font-semibold ${viewMode === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                    Tous les Pods
                </button>
                {user && (
                    <button
                        onClick={() => setViewMode("mine")}
                        className={`py-2 px-4 rounded font-semibold ${viewMode === "mine" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                        Mes Pods
                    </button>
                )}
            </div>

            {isLoading && <p className="text-center text-gray-600">Chargement des pods...</p>}
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}

            {!isLoading && !error && displayPods.length === 0 && (
                <p className="text-center text-gray-600">
                    {viewMode === "all" ? "Aucun pod disponible pour le moment." : "Vous n'avez pas encore créé de pod."}
                </p>
            )}

            {!isLoading && !error && displayPods.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayPods.map(pod => (
                        <div key={pod.id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 text-blue-600">{pod.title}</h2>
                                <p className="text-gray-700 mb-3 text-sm">
                                    {pod.description || "Pas de description disponible."}
                                </p>
                                {pod.audio_file_url && (
                                    <div className="my-3">
                                        <audio controls src={pod.audio_file_url} className="w-full">
                                            Votre navigateur ne supporte pas l'élément audio.
                                        </audio>
                                    </div>
                                )}
                                {pod.transcription && (
                                    <div className="my-3 p-3 bg-gray-100 rounded">
                                        <h4 className="font-semibold text-sm mb-1">Transcription :</h4>
                                        <p className="text-xs text-gray-600 whitespace-pre-wrap">{pod.transcription}</p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mb-1">ID du Pod: {pod.id}</p>
                                <p className="text-xs text-gray-500">Propriétaire ID: {pod.owner_id}</p>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {user?.id === pod.owner_id && (
                                    <>
                                        <button 
                                            onClick={() => handleDeletePod(pod.id)}
                                            className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                                        >
                                            Supprimer
                                        </button>
                                        {pod.audio_file_url && !pod.transcription && (
                                            <button
                                                onClick={() => handleTranscribePod(pod.id)}
                                                disabled={isTranscribing[pod.id]}
                                                className="text-sm bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded disabled:opacity-50"
                                            >
                                                {isTranscribing[pod.id] ? "Transcription..." : "Transcrire l'audio"}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PodsPage;
