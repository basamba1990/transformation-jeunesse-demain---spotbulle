// frontend/src/pages/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { profileService, discService } from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card";
import { 
  User, Edit3, Save, XCircle, Mail, Info, List, CheckCircle, ChevronRight, ChevronDown, HelpCircle 
} from 'lucide-react';
import DISCOnboardingComponent from "../components/DISCOnboardingComponent";
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

// Composant Input
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

// Composant Textarea
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

// Composant TagInput
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
        if (inputValue.trim() && !tags.includes(inputValue.trim())) {
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
                        placeholder={placeholder}
                        className="flex-grow border border-neutral-light rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button type="button" onClick={handleAddTag} variant="secondary" size="md" className="rounded-l-none">
                        Ajouter
                    </Button>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-darkest">
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
            </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout, token } = useAuth();
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

    const loadProfileData = async () => {
        try {
            const profileData = await profileService.getMyProfile();
            setProfile(profileData);
            setEditableProfile({
                bio: profileData.bio || "",
                interests: profileData.interests || [],
                skills: profileData.skills || [],
                objectives: profileData.objectives || "",
                profile_picture_url: profileData.profile_picture_url || "",
            });
            setEditableUser({
                email: user?.email || "",
                full_name: user?.full_name || "",
            });

            if (profileData.disc_type) {
                const results = await discService.getResults();
                setDiscResults(results);
            }
        } catch (error) {
            setError("Erreur lors du chargement du profil");
        }
    };

    useEffect(() => {
        if (user) loadProfileData();
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await profileService.updateProfile(editableProfile);
            setSuccessMessage("Profil mis à jour avec succès");
            setIsEditing(false);
        } catch (error) {
            setError("Erreur lors de la mise à jour du profil");
        }
        setIsLoading(false);
    };

    const handleDiscCompleted = async (results: DISCResults) => {
        setDiscResults(results);
        await loadProfileData();
        setShowDiscOnboarding(false);
    };

    return (
        <div className="container mx-auto p-4 bg-neutral-lightest min-h-screen">
            {/* ... (contenu existant préservé avec les corrections de typage) */}
        </div>
    );
};

export default ProfilePage;
