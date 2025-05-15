// frontend/src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button'; // Importer le nouveau composant Button
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'; // Importer les composants Card
import { PlayCircle, User, Users, Mic2, LogIn } from 'lucide-react'; // Icônes

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-neutral-lightest min-h-screen">
      <header className="text-center my-8 md:my-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
          Bienvenue sur Spotbulle
        </h1>
        <p className="text-lg sm:text-xl text-neutral-dark max-w-2xl mx-auto">
          Votre plateforme pour découvrir, partager et vous connecter autour de contenus audio enrichissants.
        </p>
      </header>

      {!isAuthenticated ? (
        <section className="text-center my-10">
          <Card className="max-w-md mx-auto bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">Rejoignez la communauté !</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-6">
                Connectez-vous ou créez un compte pour accéder à toutes les fonctionnalités de Spotbulle.
              </CardDescription>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" variant="primary">
                  <Link to="/login">
                    <LogIn size={20} className="mr-2" /> Se Connecter
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/register">
                    <User size={20} className="mr-2" /> S'inscrire
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="my-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-darkest mb-6 text-center">
            Que souhaitez-vous faire, {user?.full_name || user?.email} ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic2 size={24} className="mr-3 text-primary" /> Explorer les Pods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Découvrez une variété de pods partagés par la communauté ou partagez les vôtres.
                </CardDescription>
                <Button asChild variant="primary" className="w-full">
                  <Link to="/pods">Voir les Pods</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User size={24} className="mr-3 text-secondary" /> Mon Profil DISC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Consultez ou complétez votre profil DISC pour mieux vous connaître et affiner vos matchs.
                </CardDescription>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/profile/me">Accéder à mon Profil</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users size={24} className="mr-3 text-accent" /> Découvrir des Matchs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Laissez notre IA vous suggérer des profils et des contenus pertinents pour vous.
                </CardDescription>
                <Button asChild variant="accent" className="w-full">
                  <Link to="/matches">Voir mes Matchs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="my-12 py-10 bg-primary-dark text-white rounded-xl shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à plonger dans l'univers Spotbulle ?</h2>
          <p className="text-lg text-primary-light mb-8 max-w-xl mx-auto">
            Rejoignez des discussions, partagez vos passions et faites des rencontres inspirantes.
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="accent">
              <Link to="/register">Commencer l'aventure</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Vous pouvez ajouter d'autres sections ici : témoignages, fonctionnalités clés, etc. */}
    </div>
  );
};

export default HomePage;

