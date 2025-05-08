// frontend/src/ia/IABotComponent.tsx
import React, { useState } from 'react';

const IABotComponent: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse("");
    try {
      // Remplacer par un appel réel à l'API backend
      // const apiResponse = await fetch('/api/ia/bot', { // Exemple d'endpoint
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt }),
      // });
      // const data = await apiResponse.json();
      // if (data.error) {
      //   setResponse(`Erreur: ${data.error}`);
      // } else {
      //   setResponse(data.response);
      // }
      
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResponse(`Réponse simulée de l'IA pour : "${prompt}". L'intégration réelle est à faire.`);

    } catch (error) {
      setResponse("Une erreur est survenue lors de la communication avec le bot IA.");
      console.error("Error with IA Bot:", error);
    }
    setIsLoading(false);
    setPrompt("");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-center my-6">Interagir avec notre Bot IA</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-2"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Posez votre question à l'IA..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer à l'IA'}
        </button>
      </form>
      {response && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Réponse de l'IA :</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default IABotComponent;

