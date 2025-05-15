import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card";
import { UserPlus, Mail, Lock, User as UserIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = '', type, icon, ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-neutral-default" })}
        </div>
      )}
      <input
        type={type}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-neutral-light rounded-md shadow-sm placeholder-neutral-default focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${className}`}
        {...props}
      />
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email,
        password,
        full_name: fullName
      });
      
      setSuccessMessage("Inscription réussie ! Vous allez être redirigé vers la page de connexion.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.status === 404) {
        setError("Le service d'inscription est actuellement indisponible (erreur 404). Veuillez réessayer plus tard ou contacter le support.");
      } else {
        const errorMessage = err.response?.data?.detail || "Une erreur est survenue lors de l'inscription";
        setError(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-lightest p-4">
      <Link to="/" className="mb-8">
        <h1 className="text-4xl font-bold text-primary hover:text-primary-dark transition-colors">Spotbulle</h1>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Créez votre compte</CardTitle>
          <CardDescription>Rejoignez la communauté Spotbulle dès aujourd'hui.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
          {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-darker">Nom complet</label>
              <Input 
                id="fullName"
                type="text" 
                icon={<UserIcon size={20}/>}
                placeholder="Votre nom complet"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-darker">Adresse email</label>
              <Input 
                id="email"
                type="email" 
                icon={<Mail size={20}/>}
                placeholder="exemple@spotbulle.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-darker">Mot de passe</label>
              <Input 
                id="password"
                type="password" 
                icon={<Lock size={20}/>}
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-darker">Confirmer le mot de passe</label>
              <Input 
                id="confirmPassword"
                type="password" 
                icon={<Lock size={20}/>}
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
              variant="secondary"
            >
              <UserPlus size={20} className="mr-2" />
              {isLoading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Connectez-vous ici
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;

