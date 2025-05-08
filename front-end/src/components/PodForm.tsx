// frontend/src/components/PodForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPod, getPod, updatePod, IPodCreateData, IPodUpdateData } from '../services/api'; // Assurez-vous que les types sont bien définis

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
    const navigate = useNavigate();
    const { podId } = useParams<{ podId: string }>();

    useEffect(() => {
        if (mode === 'edit' && podId) {
            const fetchPodData = async () => {
                setIsLoading(true);
                try {
                    const pod = await getPod(parseInt(podId, 10));
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
        if (event.target.files && event.target.files[0]) {
            setAudioFile(event.target.files[0]);
            setExistingAudioUrl(null); // Clear existing audio if new one is selected
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);
        
        if (mode === 'create') {
            if (!audioFile) {
                setError("Un fichier audio est requis pour créer un pod.");
                setIsLoading(false);
                return;
            }
            formData.append('audio_file', audioFile);
            try {
                await createPod(formData as any); // Cast to any if createPod expects specific FormData type not easily defined
                alert('Pod créé avec succès !');
                navigate('/pods'); // Ou vers la page du pod créé
            } catch (err) {
                console.error("Error creating pod:", err);
                setError("Erreur lors de la création du pod.");
            }
        } else if (mode === 'edit' && podId) {
            if (audioFile) {
                formData.append('audio_file', audioFile);
            } // If no new audio file, backend should keep the existing one if not explicitly told to remove
            
            try {
                await updatePod(parseInt(podId, 10), formData as any);
                alert('Pod mis à jour avec succès !');
                navigate('/pods'); // Ou vers la page du pod mis à jour
            } catch (err) {
                console.error("Error updating pod:", err);
                setError("Erreur lors de la mise à jour du pod.");
            }
        }
        setIsLoading(false);
    };

    if (isLoading && mode === 'edit') return <p className="text-center text-gray-600">Chargement des données du pod...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

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
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button 
                        type="submit" 
                        disabled={isLoading} 
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

