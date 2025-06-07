import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { profileService, discService } from "../services/api";
import { Button } from "../components/ui/Button";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription
} from "../components/ui/Card";
import {
  User, Edit3, Save, XCircle, Mail, Info, List, CheckCircle, ChevronRight, ChevronDown, HelpCircle
} from 'lucide-react';
import DISCOnboardingComponent from "../components/DISCOnboardingComponent";
import type { DISCResults } from "../schemas/disc_schema";
import Alert from "../components/Alert";
import { logError } from "../utils/debug";

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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className = '', label, id, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>}
    <textarea
      id={id}
      className={`block w-full pr-3 py-2 border border-neutral-light rounded-md shadow-sm placeholder-neutral-default focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${props.readOnly ? 'bg-neutral-lightest cursor-not-allowed' : ''} ${className}`}
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
  const { user, logout, isDemoMode } = useAuth();
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
      setIsLoading(true);
      setError(null);
      
      const profileData = await profileService.getMyProfile();
      
      if (!profileData) {
        setError("Impossible de charger les données du profil");
        setIsLoading(false);
        return;
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
          setIsLoadingDisc(true);
          const results = await discService.getResults();
          setDiscResults(results);
        } catch (discError) {
          console.error("Erreur lors du chargement des résultats DISC:", discError);
          // Ne pas bloquer l'affichage du profil si les résultats DISC ne peuvent pas être chargés
        } finally {
          setIsLoadingDisc(false);
        }
      }
    } catch (error) {
      logError("Erreur lors du chargement du profil:", error);
      setError("Erreur lors du chargement du profil. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProfileData();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await profileService.updateProfile(editableProfile);
      setSuccessMessage("Profil mis à jour avec succès");
      setIsEditing(false);
      
      // Recharger les données du profil pour afficher les modifications
      await loadProfileData();
    } catch (error) {
      logError("Erreur lors de la mise à jour du profil:", error);
      setError("Erreur lors de la mise à jour du profil. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscCompleted = async (results: DISCResults) => {
    setDiscResults(results);
    await loadProfileData();
    setShowDiscOnboarding(false);
  };

  // Afficher un message si l'utilisateur est en mode démo
  const renderDemoModeWarning = () => {
    if (isDemoMode) {
      return (
        <Alert 
          type="info" 
          message="Vous êtes en mode démonstration. Les modifications ne seront pas sauvegardées." 
        />
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 bg-neutral-lightest min-h-screen">
      {renderDemoModeWarning()}
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
          <p className="ml-3 text-lg text-neutral-dark">Chargement du profil...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
          onRetry={loadProfileData} 
        />
      )}
      
      {successMessage && !isLoading && (
        <Alert 
          type="success" 
          message={successMessage} 
          onClose={() => setSuccessMessage(null)} 
        />
      )}
      
      {!isLoading && !error && user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte de profil utilisateur */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-4">
                {profile?.profile_picture_url ? (
                  <img 
                    src={profile.profile_picture_url} 
                    alt={user.full_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-primary" />
                )}
              </div>
              <CardTitle className="text-xl font-bold text-center">{user.full_name}</CardTitle>
              <p className="text-neutral-default text-sm flex items-center">
                <Mail size={16} className="mr-1" /> {user.email}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Bio</h3>
                  <p className="text-neutral-default">
                    {profile?.bio || "Aucune bio renseignée"}
                  </p>
                </div>
                
                {profile?.disc_type && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-dark mb-1">Profil DISC</h3>
                    <div className="bg-primary-lightest p-3 rounded-md">
                      <p className="font-medium text-primary">Type {profile.disc_type}</p>
                      {isLoadingDisc ? (
                        <div className="flex items-center mt-2">
                          <div className="animate-spin h-4 w-4 border-t-2 border-primary rounded-full mr-2"></div>
                          <span className="text-sm">Chargement des détails...</span>
                        </div>
                      ) : discResults ? (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          <div className="text-center">
                            <div className="font-bold">{Math.round(discResults.D * 100)}%</div>
                            <div className="text-xs">D</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{Math.round(discResults.I * 100)}%</div>
                            <div className="text-xs">I</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{Math.round(discResults.S * 100)}%</div>
                            <div className="text-xs">S</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{Math.round(discResults.C * 100)}%</div>
                            <div className="text-xs">C</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-default mt-1">Détails non disponibles</p>
                      )}
                    </div>
                  </div>
                )}
                
                {!profile?.disc_type && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-dark mb-1">Profil DISC</h3>
                    <p className="text-neutral-default mb-2">
                      Découvrez votre profil de personnalité DISC pour mieux vous connaître et trouver des personnes compatibles.
                    </p>
                    <Button 
                      onClick={() => setShowDiscOnboarding(true)} 
                      variant="primary" 
                      size="sm"
                      className="w-full"
                    >
                      Faire le test DISC
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant={isEditing ? "secondary" : "primary"} 
                size="sm"
                className="w-full"
              >
                {isEditing ? (
                  <>
                    <XCircle size={16} className="mr-2" /> Annuler les modifications
                  </>
                ) : (
                  <>
                    <Edit3 size={16} className="mr-2" /> Modifier le profil
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Formulaire de profil */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {isEditing ? "Modifier votre profil" : "Détails du profil"}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? "Modifiez vos informations personnelles et vos préférences" 
                  : "Vos informations personnelles et vos préférences"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-4">
                  <Textarea
                    id="bio"
                    label="Bio"
                    placeholder="Parlez-nous de vous..."
                    value={editableProfile.bio || ""}
                    onChange={(e) => setEditableProfile({...editableProfile, bio: e.target.value})}
                    rows={3}
                    readOnly={!isEditing}
                  />
                  
                  <TagInput
                    label="Centres d'intérêt"
                    tags={editableProfile.interests || []}
                    setTags={(tags) => setEditableProfile({...editableProfile, interests: tags})}
                    readOnly={!isEditing}
                    placeholder="Ajouter un centre d'intérêt..."
                  />
                  
                  <TagInput
                    label="Compétences"
                    tags={editableProfile.skills || []}
                    setTags={(tags) => setEditableProfile({...editableProfile, skills: tags})}
                    readOnly={!isEditing}
                    placeholder="Ajouter une compétence..."
                  />
                  
                  <Textarea
                    id="objectives"
                    label="Objectifs"
                    placeholder="Quels sont vos objectifs ?"
                    value={editableProfile.objectives || ""}
                    onChange={(e) => setEditableProfile({...editableProfile, objectives: e.target.value})}
                    rows={3}
                    readOnly={!isEditing}
                  />
                </div>
                
                {isEditing && (
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      variant="secondary" 
                      size="md"
                      className="mr-2"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" /> Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Composant d'onboarding DISC */}
      {showDiscOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Test de personnalité DISC</h2>
              <button 
                onClick={() => setShowDiscOnboarding(false)}
                className="text-neutral-default hover:text-neutral-dark"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <DISCOnboardingComponent onComplete={handleDiscCompleted} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

