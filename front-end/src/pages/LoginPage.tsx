import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginUser, getCurrentUser } from "../services/api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card";
import { LogIn as LoginIcon, Mail, Lock } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
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

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const loginResponse = await loginUser(formData);
            if (loginResponse.access_token) {
                const currentUser = await getCurrentUser();
                login(loginResponse.access_token, currentUser);
                navigate("/profile/me");
            } else {
                setError("Échec de la connexion. Veuillez vérifier vos identifiants.");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
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
                    <CardTitle className="text-2xl">Connectez-vous</CardTitle>
                    <CardDescription>Accédez à votre espace Spotbulle.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-md mb-4" role="alert">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={<Lock />}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            isLoading={isLoading} 
                            size="lg"
                            variant="primary"
                        >
                            <LoginIcon size={20} className="mr-2" />
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center">
                    <p className="text-sm text-neutral-default">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="font-medium text-primary hover:text-primary-dark hover:underline">
                            Inscrivez-vous ici
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
