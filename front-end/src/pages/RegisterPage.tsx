// frontend/src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card";
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict

// Basic Input component (can be moved to a shared ui folder if used elsewhere)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className, type, icon, ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-neutral-default" })}
        </div>
      )}
      <input
        type={type}
        className={`block w-full pl-${icon ? '10' : '3'} pr-3 py-2 border border-neutral-light rounded-md shadow-sm placeholder-neutral-default focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${className}`}
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
            const userData = {
                email,
                password,
                full_name: fullName,
            };
            await registerUser(userData);
            setSuccessMessage("Inscription réussie ! Vous allez être redirigé vers la page de connexion.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.response && err.response.data && err.response.data.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    setError(err.response.data.detail.map((e: any) => e.msg).join(", "));
                } else {
                    setError(err.response.data.detail);
                }
            } else {
                setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
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
                    {error && (
                        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-md mb-4" role="alert">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-md mb-4" role="alert">
                            <p className="text-sm">{successMessage}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-dark mb-1" htmlFor="fullName">
                                Nom complet
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Votre nom et prénom"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                icon={<UserIcon />}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-dark mb-1" htmlFor="email">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="votreadresse@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<Mail />}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-dark mb-1" htmlFor="password">
                                Mot de passe
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="•••••••• (8+ caractères)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={<Lock />}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-dark mb-1" htmlFor="confirmPassword">
                                Confirmer le mot de passe
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                icon={<Lock />}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            isLoading={isLoading} 
                            size="lg"
                            variant="secondary" // Using secondary for register to differentiate from login
                        >
                            <UserPlus size={20} className="mr-2" />
                            {isLoading ? "Inscription..." : "S'inscrire"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center">
                    <p className="text-sm text-neutral-default">
                        Déjà un compte ?{" "}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark hover:underline">
                            Connectez-vous ici
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;

