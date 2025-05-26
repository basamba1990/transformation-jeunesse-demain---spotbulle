// frontend/src/components/PodForm.tsx
PodForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { podService } from '../services/api'; // Utilisation du service complet

interface PodFormProps {
    mode: 'create' | 'edit';
}

const PodForm: React.FC<PodFormProps> = ({ mode }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState(''); // Comma-separated string
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { podId } = useParams<{ podId: string }>();

    // Constantes pour les limites de taille de fichier
    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 Mo en octets
    const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'];

    useEffect(() => {
        if (mode === 'edit' && podId) {
            const fetchPodData = async () => {
                setIsLoading(true);
                try {
                    const pod = await podService.getPod(parseInt(podId, 10));
                    setTitle(pod.title);
                    setDescription(pod.description || '');
                    setTags(pod.tags ? pod.tags.join(', ') : '');
                    setExistingAudioUrl(pod.audio_file_url || null);
                } catch (err) {
                    console.error("Error fetching pod data:", err);
                    setError("Impossible de charger les données du pod pour l'édition.");
                }
                setIsLoading(false);
            };
            fetchPodData();
        }
    }, [mode, podId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // Vérification de la taille du fichier
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`Le fichier est trop volumineux. La taille maximale est de ${MAX_FILE_SIZE / (1024 * 1024)} Mo.`);
                return;
            }
            
            // Vérification du type de fichier
            if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
                console.warn(`Type de fichier potentiellement non supporté: ${file.type}`);
                // On ne bloque pas mais on affiche un avertissement
            }
            
            setAudioFile(file);
            setExistingAudioUrl(null); // Clear existing audio if new one is selected
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        // Vérification des erreurs de fichier
        if (fileError) {
            return;
        }
        
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        if (description) formData.append('description', description);
        
        // Conversion des tags en format tableau JSON
        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            formData.append('tags', JSON.stringify(tagsArray));
        }
        
        if (mode === 'create') {
            if (!audioFile) {
                setError("Un fichier audio est requis pour créer un pod.");
                setIsLoading(false);
                return;
            }
            formData.append('audio_file', audioFile);
            
            try {
                console.log("Envoi des données:", {
                    title,
                    description,
                    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    audio_file: audioFile.name,
                    audio_file_size: `${(audioFile.size / (1024 * 1024)).toFixed(2)} Mo`
                });
                
                await podService.createPod(formData);
                alert('Pod créé avec succès !');
                navigate('/pods'); // Ou vers la page du pod créé
            } catch (err: any) {
                console.error("Error creating pod:", err);
                
                // Affichage d'un message d'erreur plus détaillé si disponible
                if (err.response && err.response.data) {
                    if (typeof err.response.data === 'string') {
                        setError(err.response.data);
                    } else if (err.response.data.detail) {
                        setError(err.response.data.detail);
                    } else {
                        setError(JSON.stringify(err.response.data));
                    }
                } else {
                    setError("Erreur lors de la création du pod. Vérifiez le format et la taille du fichier audio.");
                }
            }
        } else if (mode === 'edit' && podId) {
            if (audioFile) {
                formData.append('audio_file', audioFile);
            } // If no new audio file, backend should keep the existing one if not explicitly told to remove
            
            try {
                await podService.updatePod(parseInt(podId, 10), formData);
                alert('Pod mis à jour avec succès !');
                navigate('/pods'); // Ou vers la page du pod mis à jour
            } catch (err: any) {
                console.error("Error updating pod:", err);
                
                // Affichage d'un message d'erreur plus détaillé si disponible
                if (err.response && err.response.data) {
                    if (typeof err.response.data === 'string') {
                        setError(err.response.data);
                    } else if (err.response.data.detail) {
                        setError(err.response.data.detail);
                    } else {
                        setError(JSON.stringify(err.response.data));
                    }
                } else {
                    setError("Erreur lors de la mise à jour du pod.");
                }
            }
        }
        setIsLoading(false);
    };

    if (isLoading && mode === 'edit') return <p className="text-center text-gray-600">Chargement des données du pod...</p>;

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                {mode === 'create' ? 'Créer un nouveau Pod' : 'Modifier le Pod'}
            </h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                        Titre <span className="text-red-500">*</span>
                    </label>
                    <input 
                        id="title" 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={4}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                        Tags (séparés par des virgules)
                    </label>
                    <input 
                        id="tags" 
                        type="text" 
                        value={tags} 
                        onChange={(e) => setTags(e.target.value)} 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <p className="text-xs text-gray-500">Exemple: musique,podcast,éducation</p>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="audioFile">
                        Fichier Audio {mode === 'create' && <span className="text-red-500">*</span>}
                    </label>
                    {existingAudioUrl && mode === 'edit' && (
                        <div className="mb-2">
                            <p className="text-sm text-gray-600">Fichier audio actuel :</p>
                            <audio controls src={existingAudioUrl} className="w-full">
                                Votre navigateur ne supporte pas l'élément audio.
                            </audio>
                            <p className="text-xs text-gray-500 mt-1">Pour remplacer, choisissez un nouveau fichier ci-dessous.</p>
                        </div>
                    )}
                    <input 
                        id="audioFile" 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleFileChange} 
                        required={mode === 'create'} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {fileError && <p className="text-red-500 text-xs italic mt-1">{fileError}</p>}
                    <p className="text-xs text-gray-500 mt-1">Formats acceptés: MP3, WAV, OGG. Taille maximale: 200 Mo.</p>
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button 
                        type="submit" 
                        disabled={isLoading || !!fileError} 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                    >
                        {isLoading ? 'Envoi en cours...' : (mode === 'create' ? 'Créer Pod' : 'Mettre à jour Pod')}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/pods')} 
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PodForm;
t
