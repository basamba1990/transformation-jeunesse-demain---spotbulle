import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { profileService, discService } from "../services/api";
import {
  User, Edit3, Save, XCircle, Mail, Info, List, CheckCircle, ChevronRight, ChevronDown, HelpCircle
} from 'lucide-react';
import DISCOnboardingComponent from "../components/DISCOnboardingComponent";
import type { DISCResults } from "../schemas/disc_schema";

// ✅ Composants UI locaux (pour éviter les problèmes d'imports)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

// ✅ Interfaces corrigées
interface ProfileData {
  user_id: number;
  bio: string | null;
  interests: string[];
  skills: string[];
  objectives: string | null;
  profile_picture_url: string | null;
  disc_type: string | null;
  disc_assessment_results: DISCResults | null;
}

interface UserUpdateData {
  email?: string;
  full_name?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

const Input: React.FC<InputProps> = ({ className = '', type, icon, label, id, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-gray-400" })}
        </div>
      )}
      <input
        id={id}
        type={type}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${props.readOnly ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className = '', label, id, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      id={id}
      className={`block w-full pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${props.readOnly ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    />
  </div>
);

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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {!readOnly && (
        <div className="flex mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button type="button" onClick={handleAddTag} variant="secondary" size="md" className="rounded-l-none">
            Ajouter
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {tag}
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 flex-shrink-0 text-blue-600 hover:text-red-600"
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
  const { user, token, logout } = useAuth(); // ✅ Utilisation correcte du contexte
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

  // ✅ Gestion d'erreur améliorée
  const loadProfileData = async () => {
    try {
      setError(null); // Réinitialiser les erreurs
      const profileData = await profileService.getMyProfile();
      
      if (!profileData) {
        throw new Error("Impossible de charger le profil");
      }
      
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
        try {
          const results = await discService.getResults();
          setDiscResults(results);
        } catch (discError) {
          console.error("Erreur chargement résultats DISC:", discError);
          // Ne pas bloquer le chargement du profil pour les résultats DISC
        }
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      setError("Erreur lors du chargement du profil. Veuillez réessayer plus tard.");
    }
  };

  // ✅ Vérification d'authentification améliorée
  useEffect(() => {
    if (!user || !token) {
      // Rediriger vers login si pas d'utilisateur ou de token
      navigate('/login');
      return;
    }
    
    loadProfileData();
  }, [user, token, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updatedProfile = await profileService.updateProfile(editableProfile);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setSuccessMessage("Profil mis à jour avec succès");
        setIsEditing(false);
      } else {
        throw new Error("Échec de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      setError("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscCompleted = async (results: DISCResults) => {
    setDiscResults(results);
    await loadProfileData();
    setShowDiscOnboarding(false);
  };

  const handleRetry = () => {
    setError(null);
    loadProfileData();
  };

  // ✅ Affichage d'erreur avec bouton de retry
  if (error) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="text-center py-8">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry} variant="primary">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Affichage de chargement
  if (!profile) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          </div>
        )}

        {/* En-tête du profil */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle>{user?.full_name || 'Utilisateur'}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {user?.email}
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "primary"}
              >
                {isEditing ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Modifier
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Formulaire de profil */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et préférences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Textarea
                label="Biographie"
                id="bio"
                value={editableProfile.bio || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Parlez-nous de vous..."
                rows={4}
                readOnly={!isEditing}
              />

              <TagInput
                label="Centres d'intérêt"
                tags={editableProfile.interests || []}
                setTags={(interests) => setEditableProfile(prev => ({ ...prev, interests }))}
                readOnly={!isEditing}
                placeholder="Ajoutez un centre d'intérêt"
              />

              <TagInput
                label="Compétences"
                tags={editableProfile.skills || []}
                setTags={(skills) => setEditableProfile(prev => ({ ...prev, skills }))}
                readOnly={!isEditing}
                placeholder="Ajoutez une compétence"
              />

              <Textarea
                label="Objectifs"
                id="objectives"
                value={editableProfile.objectives || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, objectives: e.target.value }))}
                placeholder="Quels sont vos objectifs ?"
                rows={3}
                readOnly={!isEditing}
              />

              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Section DISC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Évaluation DISC
            </CardTitle>
            <CardDescription>
              Découvrez votre profil comportemental avec l'évaluation DISC
            </CardDescription>
          </CardHeader>
          <CardContent>
            {discResults ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Votre profil DISC : {discResults.disc_type}</h4>
                  <p className="text-blue-700 mt-1">{discResults.summary}</p>
                </div>
                <Button
                  onClick={() => setShowDiscOnboarding(true)}
                  variant="outline"
                >
                  Refaire l'évaluation
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore effectué l'évaluation DISC
                </p>
                <Button
                  onClick={() => setShowDiscOnboarding(true)}
                  variant="primary"
                >
                  Commencer l'évaluation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal DISC */}
        {showDiscOnboarding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <DISCOnboardingComponent
                onComplete={handleDiscCompleted}
                onClose={() => setShowDiscOnboarding(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

