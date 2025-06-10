import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Download, Activity, Clock, FileText, Cpu, CheckCircle, AlertCircle } from 'lucide-react';

interface TranscriptionServiceAdvancedProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
  realTimeMode?: boolean;
}

interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  duration: number;
  language: string;
  words: TranscriptionWord[];
  timestamps: TranscriptionTimestamp[];
  summary?: string;
  keywords?: string[];
}

interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

interface TranscriptionTimestamp {
  start: number;
  end: number;
  text: string;
}

const TranscriptionServiceAdvanced: React.FC<TranscriptionServiceAdvancedProps> = ({
  onTranscriptionComplete,
  realTimeMode = false
}) => {
  // États pour l'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // États pour la transcription
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [realTimeText, setRealTimeText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // États pour la lecture
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Références
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser l'enregistrement
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Configuration MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // Configuration AudioContext pour visualisation
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Gestion des données
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioBlob(audioBlob);
        
        // Nettoyer le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Enregistrer par chunks de 100ms

      setIsRecording(true);
      setError(null);
      
      // Démarrer le timer et la visualisation
      startTimer();
      startVisualization();

      // Mode temps réel
      if (realTimeMode) {
        startRealTimeTranscription();
      }

    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      setError('Impossible d\'accéder au microphone');
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  // Pause/reprendre l'enregistrement
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  // Timer d'enregistrement
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Visualisation audio
  const startVisualization = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculer le niveau audio moyen
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average / 255);

      // Dessiner la forme d'onde
      if (ctx) {
        ctx.fillStyle = 'rgb(30, 41, 59)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(59, 130, 246)';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    draw();
  };

  // Transcription temps réel (simulation)
  const startRealTimeTranscription = () => {
    const phrases = [
      "Bonjour et bienvenue",
      "dans cette session d'enregistrement",
      "SpotBulle utilise une IA avancée",
      "pour transcrire votre audio",
      "en temps réel avec précision"
    ];

    let phraseIndex = 0;
    const realTimeInterval = setInterval(() => {
      if (phraseIndex < phrases.length && isRecording) {
        setRealTimeText(prev => prev + (prev ? ' ' : '') + phrases[phraseIndex]);
        phraseIndex++;
      } else {
        clearInterval(realTimeInterval);
      }
    }, 2000);
  };

  // Traiter le blob audio
  const processAudioBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Simuler la transcription avancée
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: TranscriptionResult = {
        id: Date.now().toString(),
        text: realTimeText || "Transcription complète de votre enregistrement audio. SpotBulle a analysé le contenu avec une précision élevée et identifié les mots-clés principaux pour une meilleure compréhension.",
        confidence: 0.94,
        duration: recordingTime,
        language: 'fr',
        words: [
          { word: "Transcription", start: 0.5, end: 1.2, confidence: 0.95 },
          { word: "complète", start: 1.3, end: 1.8, confidence: 0.92 },
          { word: "audio", start: 2.1, end: 2.5, confidence: 0.98 }
        ],
        timestamps: [
          { start: 0, end: 5, text: "Transcription complète de votre enregistrement audio." },
          { start: 5, end: 10, text: "SpotBulle a analysé le contenu avec précision." }
        ],
        summary: "Enregistrement audio transcrit avec succès par l'IA SpotBulle",
        keywords: ["transcription", "audio", "SpotBulle", "IA", "précision"]
      };

      setTranscriptionResult(mockResult);
      
      // Créer l'URL audio pour la lecture
      const audioUrl = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
      }

      if (onTranscriptionComplete) {
        onTranscriptionComplete(mockResult);
      }

    } catch (error) {
      console.error('Erreur transcription:', error);
      setError('Erreur lors de la transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Lecture audio
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Télécharger la transcription
  const downloadTranscription = () => {
    if (transcriptionResult) {
      const content = `Transcription SpotBulle
========================

Durée: ${Math.floor(transcriptionResult.duration / 60)}:${(transcriptionResult.duration % 60).toString().padStart(2, '0')}
Confiance: ${Math.round(transcriptionResult.confidence * 100)}%
Langue: ${transcriptionResult.language.toUpperCase()}

Texte:
${transcriptionResult.text}

Mots-clés: ${transcriptionResult.keywords?.join(', ')}

Résumé: ${transcriptionResult.summary}
`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Réinitialiser
  const reset = () => {
    setRecordingTime(0);
    setRealTimeText('');
    setTranscriptionResult(null);
    setCurrentTime(0);
    setError(null);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Transcription Avancée</h3>
            <p className="text-purple-100">IA de pointe pour transcription audio précise</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
            {realTimeMode && (
              <div className="text-sm text-purple-200">Mode temps réel</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Contrôles d'enregistrement */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              >
                <Mic className="w-8 h-8" />
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="p-3 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </button>
                <button
                  onClick={stopRecording}
                  className="p-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <MicOff className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Indicateur de niveau audio */}
          {isRecording && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(audioLevel * 100)}%
              </span>
            </div>
          )}

          {/* Visualisation audio */}
          {isRecording && (
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="border border-gray-300 dark:border-gray-600 rounded-lg mx-auto"
            />
          )}
        </div>

        {/* Transcription temps réel */}
        {realTimeMode && realTimeText && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
              <Cpu className="w-5 h-5 mr-2" />
              Transcription en temps réel
            </h4>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              {realTimeText}
              {isRecording && <span className="animate-pulse">|</span>}
            </p>
          </div>
        )}

        {/* État de traitement */}
        {isTranscribing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Transcription en cours avec l'IA SpotBulle...
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Résultat de transcription */}
        {transcriptionResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                Transcription terminée
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={downloadTranscription}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Nouveau
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Confiance</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.round(transcriptionResult.confidence * 100)}%
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(transcriptionResult.duration)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Mots</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {transcriptionResult.words.length}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Langue</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {transcriptionResult.language.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Texte transcrit */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Texte transcrit
              </h5>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {transcriptionResult.text}
              </p>
            </div>

            {/* Mots-clés */}
            {transcriptionResult.keywords && transcriptionResult.keywords.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Mots-clés</h5>
                <div className="flex flex-wrap gap-2">
                  {transcriptionResult.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Résumé */}
            {transcriptionResult.summary && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Résumé</h5>
                <p className="text-green-800 dark:text-green-200">
                  {transcriptionResult.summary}
                </p>
              </div>
            )}

            {/* Contrôles de lecture */}
            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={togglePlayback}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Écouter l'enregistrement
              </div>
            </div>
          </div>
        )}

        {/* Audio caché pour la lecture */}
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default TranscriptionServiceAdvanced;

