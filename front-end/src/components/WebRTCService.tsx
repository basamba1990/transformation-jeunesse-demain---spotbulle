import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Settings, Users, Volume2, VolumeX } from 'lucide-react';

interface WebRTCServiceProps {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  roomId?: string;
}

interface PeerConnection {
  id: string;
  name: string;
  stream?: MediaStream;
  connection?: RTCPeerConnection;
}

const WebRTCService: React.FC<WebRTCServiceProps> = ({ 
  onCallStart, 
  onCallEnd, 
  roomId = 'spotbulle-room' 
}) => {
  // États pour les médias
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Références pour les éléments vidéo
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({});

  // Configuration WebRTC
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialiser les médias locaux
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Erreur accès médias:', error);
      setError('Impossible d\'accéder à la caméra/microphone');
      throw error;
    }
  };

  // Démarrer un appel
  const startCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await initializeMedia();
      setIsInCall(true);
      
      // Simuler la connexion WebRTC (en production, utiliser un serveur de signaling)
      console.log('🎥 Appel démarré dans la room:', roomId);
      
      if (onCallStart) {
        onCallStart();
      }

      // Simuler l'ajout d'un pair pour la démo
      setTimeout(() => {
        const demoPeer: PeerConnection = {
          id: 'demo-peer-1',
          name: 'Utilisateur Démo',
        };
        setPeers([demoPeer]);
      }, 2000);

    } catch (error) {
      console.error('Erreur démarrage appel:', error);
      setError('Impossible de démarrer l\'appel');
    } finally {
      setIsConnecting(false);
    }
  };

  // Terminer un appel
  const endCall = () => {
    // Arrêter le stream local
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Fermer les connexions peer
    peers.forEach(peer => {
      if (peer.connection) {
        peer.connection.close();
      }
    });

    setPeers([]);
    setIsInCall(false);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (onCallEnd) {
      onCallEnd();
    }

    console.log('📞 Appel terminé');
  };

  // Basculer l'audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Basculer la vidéo
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Video className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Communication Vidéo</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-90">Room: {roomId}</span>
            {isInCall && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm">En ligne</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone vidéo */}
      <div className="p-4">
        {!isInCall ? (
          // Interface de démarrage
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Prêt pour un appel vidéo ?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connectez-vous avec d'autres utilisateurs SpotBulle en temps réel
            </p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={startCall}
              disabled={isConnecting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Démarrer l'appel
                </>
              )}
            </button>
          </div>
        ) : (
          // Interface d'appel
          <div className="space-y-4">
            {/* Vidéos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vidéo locale */}
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-48 bg-gray-900 rounded-lg object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Vous {!isVideoEnabled && '(caméra off)'}
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Vidéos distantes */}
              {peers.map((peer) => (
                <div key={peer.id} className="relative">
                  <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                    {peer.stream ? (
                      <video
                        ref={(el) => {
                          if (el) remoteVideosRef.current[peer.id] = el;
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">En attente de {peer.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {peer.name}
                  </div>
                </div>
              ))}

              {/* Placeholder si pas de pairs */}
              {peers.length === 0 && (
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        En attente d'autres participants...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-center space-x-4 py-4">
              {/* Basculer audio */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title={isAudioEnabled ? 'Couper le micro' : 'Activer le micro'}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Basculer vidéo */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title={isVideoEnabled ? 'Couper la caméra' : 'Activer la caméra'}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Terminer l'appel */}
              <button
                onClick={endCall}
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Terminer l'appel"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

              {/* Paramètres */}
              <button
                className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Informations de l'appel */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Participants: {peers.length + 1} • Room: {roomId}</p>
              {peers.length === 0 && (
                <p className="mt-1">Partagez le lien de la room pour inviter d'autres participants</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fonctionnalités avancées */}
      {isInCall && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Connexion stable</span>
              </div>
              <div className="flex items-center">
                <Volume2 className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">Audio HD</span>
              </div>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Partager l'écran
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCService;

