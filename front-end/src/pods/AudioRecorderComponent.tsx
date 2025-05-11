// frontend/src/pods/AudioRecorderComponent.tsx
import React, { useState, useRef } from 'react';

const AudioRecorderComponent: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription("");
      setAudioURL("");
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
      alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    setTranscription("Transcription en cours...");

    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.wav");

    try {
      const response = await fetch("/api/pods/transcribe", {
        method: "POST",
        body: formData,
        headers: {
          // 'Authorization': 'Bearer VOTRE_TOKEN', // Décommentez si nécessaire
        },
      });

      const data = await response.json();

      if (data.error) {
        setTranscription(`Erreur: ${data.error}`);
      } else {
        setTranscription(data.transcription || "Pas de transcription disponible.");
      }
    } catch (err) {
      console.error("Erreur de transcription:", err);
      setTranscription("Erreur lors de la transcription.");
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-center my-6">Enregistrement Audio & Transcription</h2>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">

        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`font-bold py-2 px-4 rounded w-full mb-4 text-white 
            ${isRecording ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"}`}
          disabled={isLoading}
        >
          {isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
        </button>

        {audioURL && (
          <div className="my-4">
            <h3 className="font-semibold mb-2">Votre enregistrement :</h3>
            <audio src={audioURL} controls className="w-full" />
          </div>
        )}

        {isLoading && (
          <p className="text-center text-gray-500">Traitement en cours...</p>
        )}

        {transcription && (
          <div className="my-4 p-3 bg-gray-100 rounded">
            <h3 className="font-semibold mb-1">Transcription :</h3>
            <p>{transcription}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 text-center">
        Note : Assurez-vous que le backend est bien connecté à l'endpoint <code>/api/pods/transcribe</code>.
      </p>
    </div>
  );
};

export default AudioRecorderComponent;
