import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { podService } from "../services/api";
import type { IPod } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Mic2, Trash2, FileText, RefreshCw, Filter } from "lucide-react";
import FloatingActionButton from "../components/FloatingActionButton";
import BottomSheet from "../components/BottomSheet";
import { useSwipeable } from "react-swipeable";

const PodsPage: React.FC = () => {
    const [pods, setPods] = useState<IPod[]>([]);
    const [myPods, setMyPods] = useState<IPod[]>([]);
    const [viewMode, setViewMode] = useState<"all" | "mine">("all");
    const [isLoading, setIsLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [selectedPod, setSelectedPod] = useState<IPod | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { user } = useAuth();

    const loadPods = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (viewMode === "all") {
                const allPodsData = await podService.fetchAll();
                setPods(allPodsData);
            } else if (user) {
                const myPodsData = await podService.fetchMyPods();
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
            await podService.deletePod(podId);
            setPods(prev => prev.filter(p => p.id !== podId));
            setMyPods(prev => prev.filter(p => p.id !== podId));
            
            // Fermer le détail si le pod supprimé est celui actuellement affiché
            if (selectedPod?.id === podId) {
                setIsDetailOpen(false);
                setSelectedPod(null);
            }
            
            // Notification de succès
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
            notification.textContent = 'Pod supprimé avec succès !';
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } catch (err) {
            console.error("Error deleting pod:", err);
            setError("Erreur lors de la suppression du pod.");
        }
    };

    const handleTranscribePod = async (podId: number) => {
        if (!window.confirm("Lancer la transcription pour ce pod ? Cela peut prendre un moment.")) {
            return;
        }
        setIsTranscribing(prev => ({ ...prev, [podId]: true }));
        setError(null);
        try {
            await podService.transcribePod(podId);
            await loadPods(); // Recharger les données après transcription
            
            // Notification de succès
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
            notification.textContent = 'Transcription terminée et enregistrée !';
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } catch (err: any) {
            console.error(`Error transcribing pod ${podId}:`, err);
            setError(err.response?.data?.detail || err.message || "Erreur lors de la transcription du pod.");
        }
        setIsTranscribing(prev => ({ ...prev, [podId]: false }));
    };

    const handlePodClick = (pod: IPod) => {
        setSelectedPod(pod);
        setIsDetailOpen(true);
    };

    const swipeHandlers = useSwipeable({
        onSwipedDown: () => {
            if (isDetailOpen) {
                setIsDetailOpen(false);
            }
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: false
    });

    const displayPods = viewMode === "all" ? pods : myPods;

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

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 md:mb-0">
                    {viewMode === "all" ? "Explorer les Pods Audio" : "Mes Pods Audio"}
                </h1>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="p-2 rounded-full bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border/70 transition-colors"
                        aria-label="Filtrer"
                    >
                        <Filter size={20} />
                    </button>
                    
                    <button
                        onClick={() => loadPods()}
                        className="p-2 rounded-full bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border/70 transition-colors"
                        aria-label="Rafraîchir"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="mb-6 flex justify-center space-x-4">
                <button
                    onClick={() => setViewMode("all")}
                    className={`py-2 px-4 rounded-full font-medium transition-colors ${
                        viewMode === "all" 
                            ? "bg-primary-500 text-white shadow-md" 
                            : "bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border/70"
                    }`}
                >
                    Tous les Pods
                </button>
                {user && (
                    <button
                        onClick={() => setViewMode("mine")}
                        className={`py-2 px-4 rounded-full font-medium transition-colors ${
                            viewMode === "mine" 
                                ? "bg-primary-500 text-white shadow-md" 
                                : "bg-neutral-100 dark:bg-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border/70"
                        }`}
                    >
                        Mes Pods
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center my-12">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary-300 dark:bg-primary-700 mb-3"></div>
                        <p className="text-neutral-600 dark:text-neutral-400">Chargement des pods...</p>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                    <p className="text-center">{error}</p>
                </div>
            )}

            {!isLoading && !error && displayPods.length === 0 && (
                <div className="text-center py-12 px-4">
                    <div className="bg-neutral-50 dark:bg-dark-border/20 rounded-xl p-8 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-neutral-200 dark:bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mic2 size={24} className="text-neutral-400 dark:text-neutral-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                            {viewMode === "all" ? "Aucun pod disponible" : "Vous n'avez pas encore créé de pod"}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            {viewMode === "all" 
                                ? "Soyez le premier à partager votre voix avec la communauté !" 
                                : "Créez votre premier pod pour partager votre voix avec la communauté."}
                        </p>
                        <Link 
                            to="/pods/create" 
                            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-full transition-colors shadow-md"
                        >
                            Créer un Pod
                        </Link>
                    </div>
                </div>
            )}

            {!isLoading && !error && displayPods.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayPods.map(pod => (
                        <div 
                            key={pod.id} 
                            className="bg-white dark:bg-dark-surface shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                            onClick={() => handlePodClick(pod)}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 line-clamp-1">{pod.title}</h2>
                                    {pod.transcription && (
                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                                            Transcrit
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-neutral-700 dark:text-neutral-300 mb-4 text-sm line-clamp-2">
                                    {pod.description || "Pas de description disponible."}
                                </p>
                                
                                {pod.audio_file_url && (
                                    <div className="my-3">
                                        <audio 
                                            controls 
                                            src={pod.audio_file_url} 
                                            className="w-full" 
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Votre navigateur ne supporte pas l'élément audio.
                                        </audio>
                                    </div>
                                )}
                                
                                <div className="mt-4 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>
                                        {pod.created_at && formatDate(pod.created_at)}
                                    </span>
                                    <div className="flex items-center">
                                        <span className="mr-1">ID:</span>
                                        <span className="font-mono">{pod.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Sheet pour les détails du pod */}
            <BottomSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedPod?.title || "Détails du Pod"}
            >
                <div {...swipeHandlers}>
                    {selectedPod && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Description</h3>
                                <p className="text-neutral-800 dark:text-neutral-200">
                                    {selectedPod.description || "Pas de description disponible."}
                                </p>
                            </div>
                            
                            {selectedPod.audio_file_url && (
                                <div>
                                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Audio</h3>
                                    <audio 
                                        controls 
                                        src={selectedPod.audio_file_url} 
                                        className="w-full"
                                    >
                                        Votre navigateur ne supporte pas l'élément audio.
                                    </audio>
                                </div>
                            )}
                            
                            {selectedPod.transcription && (
                                <div>
                                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Transcription</h3>
                                    <div className="bg-neutral-50 dark:bg-dark-border/20 p-4 rounded-lg">
                                        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap text-sm">
                                            {selectedPod.transcription}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="border-t border-neutral-200 dark:border-dark-border pt-4">
                                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Informations</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-neutral-500 dark:text-neutral-400">ID: </span>
                                        <span className="text-neutral-800 dark:text-neutral-200 font-mono">{selectedPod.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500 dark:text-neutral-400">Propriétaire: </span>
                                        <span className="text-neutral-800 dark:text-neutral-200 font-mono">{selectedPod.owner_id}</span>
                                    </div>
                                    {selectedPod.created_at && (
                                        <div className="col-span-2">
                                            <span className="text-neutral-500 dark:text-neutral-400">Créé le: </span>
                                            <span className="text-neutral-800 dark:text-neutral-200">{formatDate(selectedPod.created_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {user?.id === selectedPod.owner_id && (
                                <div className="border-t border-neutral-200 dark:border-dark-border pt-4">
                                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Actions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePod(selectedPod.id);
                                            }}
                                            className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            <span>Supprimer</span>
                                        </button>
                                        
                                        {selectedPod.audio_file_url && !selectedPod.transcription && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTranscribePod(selectedPod.id);
                                                }}
                                                disabled={isTranscribing[selectedPod.id]}
                                                className="flex items-center gap-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
                                            >
                                                <FileText size={16} />
                                                <span>{isTranscribing[selectedPod.id] ? "Transcription..." : "Transcrire"}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </BottomSheet>
            
            {/* Bottom Sheet pour les filtres */}
            <BottomSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filtres"
            >
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Affichage</h3>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => {
                                    setViewMode("all");
                                    setIsFilterOpen(false);
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                                    viewMode === "all" 
                                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" 
                                        : "bg-neutral-50 dark:bg-dark-border/20 text-neutral-700 dark:text-neutral-300"
                                }`}
                            >
                                <span>Tous les Pods</span>
                                {viewMode === "all" && (
                                    <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                                )}
                            </button>
                            
                            {user && (
                                <button
                                    onClick={() => {
                                        setViewMode("mine");
                                        setIsFilterOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                                        viewMode === "mine" 
                                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" 
                                            : "bg-neutral-50 dark:bg-dark-border/20 text-neutral-700 dark:text-neutral-300"
                                    }`}
                                >
                                    <span>Mes Pods</span>
                                    {viewMode === "mine" && (
                                        <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Autres filtres potentiels à ajouter ici */}
                </div>
            </BottomSheet>

            {/* Bouton d'action flottant pour créer un pod */}
            <FloatingActionButton
                icon={<Mic2 size={24} />}
                onClick={() => window.location.href = "/pods/create"}
                position="bottom-right"
                color="primary"
            />
        </div>
    );
};

export default PodsPage;
