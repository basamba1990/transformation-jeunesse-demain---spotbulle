import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { authService } from "@services/api";
import { Button } from "@components/ui/Button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter, 
  CardDescription 
} from "@components/ui/Card";
import { LogIn as LoginIcon, Mail, Lock } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ className = '', type, icon, label, id, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-neutral-400" })}
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${className}`}
          {...props}
        />
      </div>
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
      // CORRECTION : Passer un objet avec email et password au lieu de URLSearchParams
      const userData = {
        email: email,
        password: password
      };

      // Appel corrigé via authService
      const token = await authService.loginUser(userData);
      
      if (token) {
        const userData = await authService.getCurrentUser();
        login(token, userData);
        navigate("/profile/me");
      }
    } catch (err: any) {
      console.error("Erreur de connexion :", err);
      setError(
        err.response?.data?.detail || 
        "Une erreur est survenue lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Spotbulle
          </h1>
          <p className="text-neutral-600">La plateforme de mentorat audio innovante</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Accédez à votre espace personnel
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                id="email"
                type="email"
                label="Adresse email"
                placeholder="exemple@spotbulle.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail />}
              />

              <Input
                id="password"
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Connexion en cours...</span>
                ) : (
                  <>
                    <LoginIcon className="mr-2 h-5 w-5" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pt-4 border-t border-neutral-100">
            <p className="text-sm text-neutral-600">
              Nouveau sur Spotbulle ?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
