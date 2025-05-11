import React, { useState } from 'react';

const IABotComponent: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const apiResponse = await fetch('/api/ia/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await apiResponse.json();

      if (data.error) {
        setResponse(`Erreur: ${data.error}`);
      } else {
        setResponse(data.response || "Réponse vide.");
      }

    } catch (error) {
      console.error("Erreur avec le bot IA:", error);
      setResponse("Une erreur est survenue lors de la communication avec le bot IA.");
    }

    setIsLoading(false);
    setPrompt("");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-center my-6">Interagir avec notre Bot IA</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded mb-2"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Posez votre question à l'IA..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          disabled={isLoading}
        >
          {isLoading ? "Envoi en cours..." : "Envoyer à l'IA"}
        </button>
      </form>

      {response && (
        <div className="bg-gray-100 p-4 rounded shadow-inner">
          <h3 className="font-semibold mb-2">Réponse de l'IA :</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};

export default IABotComponent;
