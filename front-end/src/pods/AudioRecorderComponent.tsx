// frontend/src/pods/AudioRecorderComponent.tsx
import React, { useState, useRef } from 'react';

const AudioRecorderComponent: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const [transcription, setTranscription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        // Ici, vous enverriez audioBlob au backend pour traitement et transcription
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscription(""); // Réinitialiser la transcription précédente
      setAudioURL(""); // Réinitialiser l'URL audio précédente
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
      alert("Impossible d'accéder au microphone. Veuillez vérifier les permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Le traitement et la transcription se feront dans mediaRecorderRef.current.onstop
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    setTranscription("Transcription en cours...");
    // Simuler l'appel API pour la transcription
    // const formData = new FormData();
    // formData.append("audio_file", audioBlob, "recording.wav");
    // try {
    //   const response = await fetch("/api/pods/transcribe", { // Exemple d'endpoint
    //     method: "POST",
    //     body: formData,
    //     // Headers: { 'Authorization': 'Bearer VOTRE_TOKEN_JWT' } // Si authentification nécessaire
    //   });
    //   const data = await response.json();
    //   if (data.error) {
    //     setTranscription(`Erreur de transcription: ${data.error}`);
    //   } else {
    //     setTranscription(data.transcription || "Aucune transcription disponible.");
    //   }
    // } catch (error) {
    //   console.error("Erreur de transcription:", error);
    //   setTranscription("Erreur lors de la tentative de transcription.");
    // }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simuler la latence réseau
    setTranscription("Ceci est une transcription simulée de votre enregistrement audio. L'intégration réelle est à faire.");
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-center my-6">Enregistrement Audio & Transcription</h2>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {!isRecording ? (
          <button 
            onClick={handleStartRecording} 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
            disabled={isLoading}
          >
            Démarrer l'enregistrement
          </button>
        ) : (
          <button 
            onClick={handleStopRecording} 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
            disabled={isLoading}
          >
            Arrêter l'enregistrement
          </button>
        )}
        {audioURL && (
          <div className="my-4">
            <h3 className="font-semibold">Votre enregistrement :</h3>
            <audio src={audioURL} controls className="w-full" />
          </div>
        )}
        {isLoading && <p className="text-center">Traitement en cours...</p>}
        {transcription && (
          <div className="my-4 p-3 bg-gray-100 rounded">
            <h3 className="font-semibold">Transcription :</h3>
            <p>{transcription}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 text-center">Note: L'enregistrement et la transcription sont simulés et nécessitent une intégration backend complète.</p>
    </div>
  );
};

export default AudioRecorderComponent;

