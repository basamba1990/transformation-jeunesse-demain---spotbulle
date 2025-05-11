import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  fetchMyProfile, 
  updateMyProfile, 
  updateCurrentUserProfile, 
  getMyDISCResults, 
  submitMyDiscAssessment, 
  getDiscQuestionnaire 
} from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card";
import { User, Edit3, Save, XCircle, Mail, Info, List, CheckCircle, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import { DISCOnboardingComponent } from "../components/DISCOnboardingComponent";
import type { DISCResults, DISCScores } from "../schemas/disc_schema";

interface ProfileData {
    user_id: number;
    bio: string | null;
    interests: string[];
    skills: string[];
    objectives: string | null;
    profile_picture_url: string | null;
    disc_type: string | null;
    disc_assessment_results: DISCScores | null;
}

interface UserUpdateData {
    email?: string;
    full_name?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    label?: string;
}

const Input: React.FC<InputProps> = ({ className = '', type, icon, label, id, ...props }) => {
    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-neutral-default" })}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-neutral-light rounded-md shadow-sm placeholder-neutral-default focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${props.readOnly ? 'bg-neutral-lightest cursor-not-allowed' : ''} ${className}`}
                    {...props}
                />
            </div>
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className = '', label, id, ...props }) => {
    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>}
            <textarea
                id={id}
                className={`block w-full pr-3 py-2 border border-neutral-light rounded-md shadow-sm placeholder-neutral-default focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${props.readOnly ? 'bg-neutral-lightest cursor-not-allowed' : ''} ${className}`}
                {...props}
            />
        </div>
    );
};

interface TagInputProps {
    label: string;
    tags: string[];
    setTags: (tags: string[]) => void;
    readOnly?: boolean;
    placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, setTags, readOnly, placeholder }) => {
    const [inputValue, setInputValue] = useState("");

    const handleAddTag = () => {
        if (inputValue.trim() !== "" && !tags.includes(inputValue.trim())) {
            setTags([...tags, inputValue.trim()]);
            setInputValue("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>
            {!readOnly && (
                <div className="flex mb-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder || "Ajouter un tag..."}
                        className="flex-grow border border-neutral-light rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        onKeyDown={(e) => { 
                            if (e.key === 'Enter' || e.key === ',') { 
                                e.preventDefault(); 
                                handleAddTag(); 
                            } 
                        }}
                    />
                    <Button type="button" onClick={handleAddTag} variant="secondary" size="md" className="rounded-l-none">
                        Ajouter
                    </Button>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-darkest">
                        {tag}
                        {!readOnly && (
                            <button 
                                type="button" 
                                onClick={() => handleRemoveTag(tag)} 
                                className="ml-1.5 flex-shrink-0 text-primary-dark hover:text-danger"
                            >
                                <XCircle size={14} />
                            </button>
                        )}
                    </span>
                ))}
                {tags.length === 0 && readOnly && <p className="text-sm text-neutral-default">Aucun {label.toLowerCase()} spécifié.</p>}
            </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { user, isLoading: authLoading, login, token } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [editableProfile, setEditableProfile] = useState<Partial<ProfileData>>({});
    const [editableUser, setEditableUser] = useState<Partial<UserUpdateData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDiscOnboarding, setShowDiscOnboarding] = useState(false);
    const [discResults, setDiscResults] = useState<DISCResults | null>(null);
    const [isLoadingDisc, setIsLoadingDisc] = useState(false);

    const loadProfileAndDisc = async () => {
        if (user && !authLoading) {
            setIsLoading(true);
            setError(null);
            try {
                const profileData = await fetchMyProfile();
                setProfile(profileData);
                setEditableProfile({
                    bio: profileData.bio || "",
                    interests: profileData.interests || [],
                    skills: profileData.skills || [],
                    objectives: profileData.objectives || "",
                    profile_picture_url: profileData.profile_picture_url || "",
                });
                setEditableUser({
                    email: user.email || "",
                    full_name: user.full_name || "",
                });

                if (profileData.disc_type) {
                    setIsLoadingDisc(true);
                    const currentDiscResults = await getMyDISCResults();
                    setDiscResults(currentDiscResults);
                    setIsLoadingDisc(false);
                }

            } catch (err) {
                console.error("Error loading profile:", err);
                setError("Impossible de charger le profil. Veuillez réessayer.");
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfileAndDisc();
    }, [user, authLoading]);

    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            let updatedUser = user;
            if (editableUser.email !== user?.email || editableUser.full_name !== user?.full_name) {
                const userUpdatePayload: UserUpdateData = {};
                if (editableUser.email && editableUser.email !== user?.email) userUpdatePayload.email = editableUser.email;
                if (editableUser.full_name && editableUser.full_name !== user?.full_name) userUpdatePayload.full_name = editableUser.full_name;
                
                if (Object.keys(userUpdatePayload).length > 0 && user?.id) {
                  updatedUser = await updateCurrentUserProfile(user.id, userUpdatePayload);
                }
            }
            
            const profileToUpdate: Partial<ProfileData> = {
                ...editableProfile,
                interests: Array.isArray(editableProfile.interests) ? editableProfile.interests : (editableProfile.interests?.split(',').map(s => s.trim()).filter(s => s) || []),
                skills: Array.isArray(editableProfile.skills) ? editableProfile.skills : (editableProfile.skills?.split(',').map(s => s.trim()).filter(s => s) || []),
            };

            const updatedProfileData = await updateMyProfile(profileToUpdate);
            setProfile(updatedProfileData);
            if (token && updatedUser) {
                login(token, updatedUser);
            }
            setSuccessMessage("Profil mis à jour avec succès !");
            setIsEditing(false);
        } catch (err: any) {
            console.error("Error updating profile:", err);
            let errorMessage = "Une erreur est survenue lors de la mise à jour du profil.";
            if (err.response?.data?.detail) {
                errorMessage = Array.isArray(err.response.data.detail) ? 
                    err.response.data.detail.map((e: any) => e.msg).join(", ") : 
                    err.response.data.detail;
            }
            setError(errorMessage);
        }
        setIsLoading(false);
    };

    const handleDiscCompleted = async () => {
        setShowDiscOnboarding(false);
        setIsLoadingDisc(true);
        try {
            const results = await getMyDISCResults();
            setDiscResults(results);
            const profileData = await fetchMyProfile();
            setProfile(profileData);
        } catch (error) {
            console.error("Erreur lors de la récupération des résultats DISC:", error);
            setError("Impossible de charger les résultats DISC.");
        }
        setIsLoadingDisc(false);
    };

    if (authLoading || (isLoading && !profile)) {
        return <div className="container mx-auto p-4 text-center"><p className="text-lg text-neutral-default">Chargement du profil...</p></div>;
    }

    if (!user || !profile) {
        return (
            <div className="container mx-auto p-4 text-center">
                <Card className="max-w-md mx-auto mt-10">
                    <CardHeader><CardTitle>Erreur de Profil</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-danger mb-4">{error || "Impossible d'afficher le profil. Veuillez vous reconnecter."}</p>
                        <Button onClick={() => navigate("/login")} variant="primary">Se connecter</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-neutral-lightest min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary text-center">Mon Espace Profil</h1>
            </header>

            {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-md mb-6" role="alert">
                    <p>{error}</p>
                </div>
            )}
            {successMessage && (
                <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-md mb-6" role="alert">
                    <p>{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl flex items-center">
                                    <User size={22} className="mr-2 text-primary" /> Informations du Compte
                                </CardTitle>
                                <CardDescription>Gérez vos informations personnelles et de profil.</CardDescription>
                            </div>
                            {!isEditing && (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit3 size={16} className="mr-2" /> Modifier
                                </Button>
                            )}
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <Input 
                                    label="Nom complet" 
                                    id="fullName" 
                                    name="full_name" 
                                    type="text" 
                                    value={editableUser.full_name || ""} 
                                    onChange={handleUserInputChange} 
                                    readOnly={!isEditing} 
                                    icon={<User size={18}/>}
                                />
                                <Input 
                                    label="Email" 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    value={editableUser.email || ""} 
                                    onChange={handleUserInputChange} 
                                    readOnly={!isEditing} 
                                    icon={<Mail size={18}/>}
                                />
                                <Textarea 
                                    label="Bio" 
                                    id="bio" 
                                    name="bio" 
                                    rows={4} 
                                    placeholder="Parlez un peu de vous..." 
                                    value={editableProfile.bio || ""} 
                                    onChange={handleProfileInputChange} 
                                    readOnly={!isEditing} 
                                />
                                <TagInput 
                                    label="Centres d'intérêt" 
                                    tags={editableProfile.interests || []} 
                                    setTags={(newTags) => setEditableProfile(prev => ({...prev, interests: newTags}))} 
                                    readOnly={!isEditing}
                                    placeholder="Ex: Lecture, IA, Musique..."
                                />
                                <TagInput 
                                    label="Compétences" 
                                    tags={editableProfile.skills || []} 
                                    setTags={(newTags) => setEditableProfile(prev => ({...prev, skills: newTags}))} 
                                    readOnly={!isEditing}
                                    placeholder="Ex: Python, Design, Communication..."
                                />
                                <Textarea 
                                    label="Objectifs sur Spotbulle" 
                                    id="objectives" 
                                    name="objectives" 
                                    rows={3} 
                                    placeholder="Que cherchez-vous à accomplir ici ?"
                                    value={editableProfile.objectives || ""} 
                                    onChange={handleProfileInputChange} 
                                    readOnly={!isEditing} 
                                />
                            </CardContent>
                            {isEditing && (
                                <CardFooter className="flex justify-end space-x-3">
                                    <Button type="button" variant="neutral" onClick={() => { setIsEditing(false); loadProfileAndDisc(); }}>
                                        <XCircle size={18} className="mr-2" /> Annuler
                                    </Button>
                                    <Button type="submit" variant="primary" isLoading={isLoading} >
                                        <Save size={18} className="mr-2" /> {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                                    </Button>
                                </CardFooter>
                            )}
                        </form>
                    </Card>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center">
                                <HelpCircle size={22} className="mr-2 text-secondary" /> Mon Profil DISC
                            </CardTitle>
                            <CardDescription>Découvrez votre style comportemental.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingDisc && <p className="text-neutral-default">Chargement des résultats DISC...</p>}
                            {!isLoadingDisc && discResults && profile?.disc_type && (
                                <div className="space-y-3">
                                    <p className="text-lg">
                                        Votre type principal : <span className="font-bold text-2xl text-secondary">{discResults.disc_type}</span>
                                    </p>
                                    <p className="text-sm text-neutral-dark">{discResults.summary}</p>
                                    <div>
                                        <h4 className="font-semibold mb-1 text-neutral-darkest">Scores détaillés :</h4>
                                        <ul className="list-disc list-inside pl-1 space-y-1 text-sm">
                                            <li>Dominance (D): <span className="font-medium">{discResults.scores.D}</span></li>
                                            <li>Influence (I): <span className="font-medium">{discResults.scores.I}</span></li>
                                            <li>Stabilité (S): <span className="font-medium">{discResults.scores.S}</span></li>
                                            <li>Conformité (C): <span className="font-medium">{discResults.scores.C}</span></li>
                                        </ul>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setShowDiscOnboarding(true)} className="mt-4 w-full">
                                        Refaire l'évaluation DISC
                                    </Button>
                                </div>
                            )}
                            {!isLoadingDisc && !profile?.disc_type && (
                                <div className="text-center">
                                    <p className="mb-4 text-neutral-default">Vous n'avez pas encore complété votre évaluation DISC.</p>
                                    <Button variant="secondary" onClick={() => setShowDiscOnboarding(true)} className="w-full">
                                        Commencer l'évaluation DISC
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showDiscOnboarding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Évaluation DISC</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setShowDiscOnboarding(false)}>
                                <XCircle />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DISCOnboardingComponent onCompleted={handleDiscCompleted} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
