import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Video, Camera, Monitor, Settings, Users, Mic, MicOff, VideoOff, Phone, PhoneOff } from 'lucide-react';
import WebRTCService from '../components/WebRTCService';

const VideoServicePage: React.FC = () => {
  const { user } = useAuth();
  const [activeService, setActiveService] = useState<'webrtc' | 'recording' | 'streaming'>('webrtc');

  const services = [
    {
      id: 'webrtc' as const,
      label: 'Appels Vidéo',
      icon: Video,
      description: 'Communication vidéo en temps réel'
    },
    {
      id: 'recording' as const,
      label: 'Enregistrement',
      icon: Camera,
      description: 'Enregistrement vidéo professionnel'
    },
    {
      id: 'streaming' as const,
      label: 'Diffusion Live',
      icon: Monitor,
      description: 'Streaming en direct'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Services Vidéo SpotBulle
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Suite complète d'outils vidéo pour communication, enregistrement et diffusion
          </p>
        </div>

        {/* Navigation des services */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeService === service.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{service.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              {services.find(service => service.id === activeService)?.description}
            </p>
          </div>
        </div>

        {/* Contenu des services */}
        <div className="space-y-6">
          {activeService === 'webrtc' && (
            <div className="space-y-6">
              {/* Statistiques des appels */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <Video className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">HD Vidéo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1080p 60fps</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <Mic className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Cristallin</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Suppression de bruit</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-participants</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jusqu'à 10 personnes</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <Settings className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paramètres Avancés</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contrôle total</p>
                </div>
              </div>

              {/* Service WebRTC */}
              <WebRTCService 
                roomId={`spotbulle-video-${user?.id || 'guest'}`}
                onCallStart={() => console.log('Appel vidéo démarré')}
                onCallEnd={() => console.log('Appel vidéo terminé')}
              />
            </div>
          )}

          {activeService === 'recording' && (
            <div className="space-y-6">
              {/* Interface d'enregistrement */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Enregistrement Vidéo</h3>
                      <p className="text-red-100">Créez des contenus vidéo professionnels</p>
                    </div>
                    <Camera className="w-12 h-12 text-red-200" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Enregistrement Vidéo Professionnel
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Enregistrez des vidéos haute qualité pour vos pods SpotBulle
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Qualité 4K</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enregistrement ultra haute définition</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Multi-caméras</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Plusieurs angles simultanés</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Édition Intégrée</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Outils d'édition avancés</p>
                      </div>
                    </div>

                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto">
                      <Camera className="w-5 h-5 mr-2" />
                      Démarrer l'enregistrement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeService === 'streaming' && (
            <div className="space-y-6">
              {/* Interface de streaming */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Diffusion en Direct</h3>
                      <p className="text-purple-100">Partagez vos contenus en temps réel</p>
                    </div>
                    <Monitor className="w-12 h-12 text-purple-200" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Streaming Live SpotBulle
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Diffusez vos sessions en direct vers votre audience
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Plateformes Supportées</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• YouTube Live</li>
                          <li>• Facebook Live</li>
                          <li>• Twitch</li>
                          <li>• LinkedIn Live</li>
                        </ul>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Fonctionnalités</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Chat en temps réel</li>
                          <li>• Partage d'écran</li>
                          <li>• Overlays personnalisés</li>
                          <li>• Analytics en direct</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                        <Monitor className="w-5 h-5 mr-2" />
                        Configurer le stream
                      </button>
                      <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Tester la connexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paramètres de streaming */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Paramètres de Diffusion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Qualité de diffusion
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                      <option>1080p (Recommandé)</option>
                      <option>720p</option>
                      <option>480p</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Débit (bitrate)
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                      <option>6000 kbps (Haute qualité)</option>
                      <option>4000 kbps (Qualité standard)</option>
                      <option>2500 kbps (Économique)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoServicePage;

