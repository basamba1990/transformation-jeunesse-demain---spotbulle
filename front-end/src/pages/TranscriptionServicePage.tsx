import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, Video, FileText, Users, Headphones, MessageSquare, Settings, Plus } from 'lucide-react';
import TranscriptionServiceAdvanced from '../components/TranscriptionServiceAdvanced';
import WebRTCService from '../components/WebRTCService';

const TranscriptionServicePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'transcription' | 'video' | 'collaboration'>('transcription');
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);

  const tabs = [
    {
      id: 'transcription' as const,
      label: 'Transcription IA',
      icon: FileText,
      description: 'Transcription audio avancée avec IA'
    },
    {
      id: 'video' as const,
      label: 'Appel Vidéo',
      icon: Video,
      description: 'Communication vidéo en temps réel'
    },
    {
      id: 'collaboration' as const,
      label: 'Collaboration',
      icon: Users,
      description: 'Outils collaboratifs intégrés'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Services de Communication
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Outils avancés de transcription, communication vidéo et collaboration pour SpotBulle
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Description de l'onglet actif */}
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'transcription' && (
            <div className="space-y-6">
              {/* Options de transcription */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Options de Transcription
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isRealTimeMode}
                      onChange={(e) => setIsRealTimeMode(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mode temps réel
                    </span>
                  </label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Transcription en direct pendant l'enregistrement
                  </div>
                </div>
              </div>

              {/* Composant de transcription */}
              <TranscriptionServiceAdvanced 
                realTimeMode={isRealTimeMode}
                onTranscriptionComplete={(result) => {
                  console.log('Transcription terminée:', result);
                }}
              />
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Informations sur l'appel vidéo */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Communication Vidéo SpotBulle
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Video className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">HD Vidéo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qualité 1080p</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Headphones className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Audio Cristallin</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suppression de bruit</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Multi-participants</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Jusqu'à 10 personnes</p>
                  </div>
                </div>
              </div>

              {/* Composant WebRTC */}
              <WebRTCService 
                roomId={`spotbulle-${user?.id || 'guest'}`}
                onCallStart={() => console.log('Appel démarré')}
                onCallEnd={() => console.log('Appel terminé')}
              />
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              {/* Outils de collaboration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chat en temps réel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Chat en Temps Réel
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                              <p className="text-sm text-gray-900 dark:text-white">
                                Bienvenue dans le chat collaboratif SpotBulle !
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Il y a quelques instants
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Tapez votre message..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Partage de fichiers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Partage de Fichiers
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Glissez-déposez vos fichiers ici
                      </p>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Choisir des fichiers
                      </button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Fichiers récents</h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Aucun fichier partagé récemment
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau blanc collaboratif */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tableau Blanc Collaboratif
                    </h3>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Nouveau tableau
                  </button>
                </div>
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Tableau blanc collaboratif en temps réel
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Dessinez, annotez et collaborez ensemble
                    </p>
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

export default TranscriptionServicePage;

