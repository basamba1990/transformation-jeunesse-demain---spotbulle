import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { PlayCircle, User, Users, Mic2, LogIn, Heart, MessageCircle, Share, ArrowRight } from 'lucide-react';
import AudioResourceCard from '../components/AudioResourceCard';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-earth-100 dark:from-dark-bg dark:to-dark-surface texture-paper">
      <header className="relative overflow-hidden py-20 md:py-32 fade-in">
        {/* Éléments décoratifs en arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary-300 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-accent-300 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-primary-600 dark:text-primary-300 mb-6 leading-tight">
                Bienvenue sur <span className="text-accent-400">Spotbulle</span>
              </h1>
              <p className="font-sans text-lg sm:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl leading-relaxed">
                Votre plateforme pour découvrir, partager et vous connecter autour de contenus audio enrichissants.
              </p>
              
              {!isAuthenticated && (
                <div className="mt-10 relative group inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-400 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition duration-200"></div>
                  <Button asChild size="lg" variant="primary" className="relative bg-white dark:bg-dark-surface px-8 py-4 rounded-lg font-medium text-primary-600 dark:text-primary-300 shadow-md hover:shadow-xl transition-all duration-300">
                    <Link to="/register">Commencer l'aventure</Link>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Intégration du logo SpotBulle */}
            <div className="w-full md:w-auto flex justify-center">
              <img 
                src="/assets/logo_spotbulle.png" 
                alt="SpotBulle Logo" 
                className="w-64 h-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {!isAuthenticated ? (
        <section className="text-center my-10 fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="max-w-md mx-auto bg-white dark:bg-dark-surface card-artisanal">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Rejoignez la communauté !</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-6">
                Connectez-vous ou créez un compte pour accéder à toutes les fonctionnalités de Spotbulle.
              </CardDescription>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" variant="primary" className="btn-artisanal">
                  <Link to="/login">
                    <LogIn size={20} className="mr-2" /> Se Connecter
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="btn-artisanal">
                  <Link to="/register">
                    <User size={20} className="mr-2" /> S'inscrire
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="my-10 fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-darkest dark:text-dark-text mb-6 text-center title-artisanal">
            Que souhaitez-vous faire, <span className="font-handwritten text-primary-500">{user?.full_name || user?.email}</span> ?
          </h2>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Carte Pods */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-300 to-primary-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg transition-all duration-300 group-hover:translate-y-[-2px]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mic2 size={24} className="mr-3 text-primary-500 group-hover:animate-pulse" /> Explorer les Pods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Découvrez une variété de pods partagés par la communauté ou partagez les vôtres.
                    </CardDescription>
                    <Button asChild variant="primary" className="w-full btn-artisanal">
                      <Link to="/pods">Voir les Pods</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Carte Profil */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary-300 to-secondary-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg transition-all duration-300 group-hover:translate-y-[-2px]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User size={24} className="mr-3 text-secondary-500 group-hover:animate-pulse" /> Mon Profil DISC
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Consultez ou complétez votre profil DISC pour mieux vous connaître et affiner vos matchs.
                    </CardDescription>
                    <Button asChild variant="secondary" className="w-full btn-artisanal">
                      <Link to="/profile/me">Accéder à mon Profil</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Carte Matchs */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-300 to-accent-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg transition-all duration-300 group-hover:translate-y-[-2px]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users size={24} className="mr-3 text-accent-400 group-hover:animate-pulse" /> Découvrir des Matchs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Laissez notre IA vous suggérer des profils et des contenus pertinents pour vous.
                    </CardDescription>
                    <Button asChild variant="accent" className="w-full btn-artisanal">
                      <Link to="/matches">Voir mes Matchs</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Pod en vedette */}
      <section className="my-12 container mx-auto px-4 sm:px-6 lg:px-8 fade-in" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-darkest dark:text-dark-text mb-6 text-center title-artisanal">
          Pods en vedette
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pod en vedette */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-300 to-accent-300 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg transition-all duration-300 group-hover:translate-y-[-2px]">
              <div className="flex items-start gap-4">
                {/* Vignette audio avec effet vinyle */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-400 dark:from-primary-700 dark:to-primary-900"></div>
                  <div className="absolute inset-2 bg-neutral-900 rounded-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle size={24} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-1">Transformation Jeunesse</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Par Spotbulle • 15 min</p>
                  
                  {/* Tags avec style artisanal */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-nature-100 dark:bg-nature-300/20 text-nature-400 dark:text-nature-300">Jeunesse</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-700/20 text-primary-600 dark:text-primary-300">Avenir</span>
                  </div>
                </div>
              </div>
              
              {/* Visualisation audio stylisée */}
              <div className="mt-4 h-12 w-full bg-neutral-100 dark:bg-dark-border rounded-lg overflow-hidden">
                <div className="h-full w-full flex items-center justify-around px-2">
                  {Array.from({length: 40}).map((_, i) => (
                    <div 
                      key={i}
                      className="h-[10%] w-[1px] bg-primary-400 dark:bg-primary-500 opacity-70"
                      style={{
                        height: `${10 + Math.random() * 70}%`,
                        opacity: 0.3 + Math.random() * 0.7
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Actions avec micro-interactions */}
              <div className="mt-4 flex justify-between">
                <button className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                  <div className="flex items-center gap-1">
                    <Heart size={18} />
                    <span className="text-sm">24</span>
                  </div>
                </button>
                
                <button className="text-neutral-600 dark:text-neutral-400 hover:text-accent-500 dark:hover:text-accent-300 transition-colors">
                  <div className="flex items-center gap-1">
                    <MessageCircle size={18} />
                    <span className="text-sm">8</span>
                  </div>
                </button>
                
                <button className="text-neutral-600 dark:text-neutral-400 hover:text-secondary-500 dark:hover:text-secondary-300 transition-colors">
                  <div className="flex items-center gap-1">
                    <Share size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Texte descriptif */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-display font-semibold text-primary-600 dark:text-primary-300 mb-4">
              Découvrez nos contenus exclusifs
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              Plongez dans notre sélection de pods soigneusement créés pour vous inspirer et vous connecter avec d'autres passionnés. Chaque semaine, de nouveaux contenus sont mis en avant pour élargir vos horizons.
            </p>
            <div className="relative group inline-block self-start">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <Button variant="secondary" className="relative bg-white dark:bg-dark-surface px-6 py-3 rounded-lg font-medium text-secondary-600 dark:text-secondary-300 shadow-md hover:shadow-xl transition-all duration-300">
                Explorer tous les pods
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Spotter sa voix - Intégration de l'image promotionnelle */}
      <section className="my-12 container mx-auto px-4">
        <div className="bg-purple-600 rounded-xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Spotter sa voix, c'est révéler sa beauté intérieure
              </h2>
              <p className="text-purple-100 mb-2">
                Tu n'es pas là pour réciter, mais pour vibrer.
              </p>
              <p className="text-purple-100">
                Chez SpotBulle, on t'aide à transformer ton énergie en message, ton vécu en impact.
              </p>
            </div>
            <div className="relative h-full min-h-[300px] md:min-h-0">
              <img 
                src="/assets/spotter_sa_voix.jpg" 
                alt="Jeune au microphone" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section IA - Intégration de l'image Huxe */}
      <section className="my-12 bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Construisons votre intelligence personnelle</h2>
              <p className="text-gray-300 mb-4">
                L'avenir de l'IA n'est pas seulement intelligent : il est profondément personnalisé, 
                s'adaptant à vous, à vos données et à vos besoins.
              </p>
              <p className="text-xl mt-8">À venir</p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <img 
                  src="/assets/huxe_particles.jpg" 
                  alt="Intelligence personnelle" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Ressources - Intégration des liens externes */}
      <section className="my-12 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Ressources pour la jeunesse</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a 
            href="https://www.1jeune1solution.gouv.fr/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">1 jeune, 1 solution</h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Plateforme pour aider les jeunes à trouver un emploi, une formation ou un accompagnement.
            </p>
            <span className="text-primary-500 flex items-center">
              Découvrir <ArrowRight size={16} className="ml-1" />
            </span>
          </a>
          
          <a 
            href="https://www.onisep.fr/avenir-s" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Onisep - Avenir(s)</h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Informations et conseils sur les métiers, les formations et l'orientation.
            </p>
            <span className="text-primary-500 flex items-center">
              Explorer <ArrowRight size={16} className="ml-1" />
            </span>
          </a>
          
          <div className="block p-6 bg-white dark:bg-dark-surface rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">Partenaire GenUP 2050</h3>
            <div className="flex justify-center my-4">
              <img 
                src="/assets/logo_genup2050.png" 
                alt="GenUP 2050" 
                className="h-16 w-auto"
              />
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Notre partenaire pour la transformation et l'accompagnement de la jeunesse.
            </p>
          </div>
        </div>
      </section>

      {/* Section Ressources Audio */}
      <section className="my-12 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Ressources audio</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AudioResourceCard 
            title="Modèle économique"
            description="Présentation du modèle économique de SpotBulle et de son impact sur la jeunesse."
            audioSrc="/assets/audio/EconomicModel.wav"
          />
          
          <AudioResourceCard 
            title="Transformation Jeunesse"
            description="Comment SpotBulle accompagne la transformation de la jeunesse."
            audioSrc="/assets/audio/sample.mp3"
          />
        </div>
      </section>

      <section className="my-12 py-10 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl shadow-xl fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Prêt à plonger dans l'univers Spotbulle ?</h2>
          <p className="text-lg text-primary-200 mb-8 max-w-xl mx-auto">
            Rejoignez des discussions, partagez vos passions et faites des rencontres inspirantes.
          </p>
          {!isAuthenticated && (
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-300 to-accent-500 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <Button asChild size="lg" variant="accent" className="relative bg-accent-500 px-8 py-4 rounded-lg font-medium text-white shadow-md hover:shadow-xl transition-all duration-300">
                <Link to="/register">Commencer l'aventure</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
