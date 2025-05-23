# backend/app/services/transcription_service.py
import openai
import httpx
import os
import tempfile
from fastapi import HTTPException, status

from .config import settings # Pour récupérer OPENAI_API_KEY

# Initialiser le client OpenAI
# Assurez-vous que la variable d'environnement OPENAI_API_KEY est définie
if not settings.OPENAI_API_KEY:
    print("AVERTISSEMENT: La variable d'environnement OPENAI_API_KEY n'est pas définie. La transcription ne fonctionnera pas.")
    # Vous pourriez lever une exception ici si la clé est absolument nécessaire au démarrage
    # raise ValueError("OPENAI_API_KEY must be set in environment variables")

client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

async def transcribe_audio_with_whisper(audio_file_url: str) -> str | None:
    """
    Télécharge un fichier audio depuis une URL, le transcrit avec OpenAI Whisper,
    et retourne la transcription.
    """
    if not settings.OPENAI_API_KEY:
        print("Transcription ignorée car OPENAI_API_KEY n'est pas configurée.")
        # Retourner None ou une chaîne vide, ou lever une exception selon la politique de gestion d'erreur
        # Pour l'instant, on retourne None pour ne pas bloquer si la clé n'est pas là pendant le dev
        return "Transcription non disponible (clé API OpenAI manquante)."

    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(audio_file_url)
            response.raise_for_status() # Lève une exception pour les codes d'erreur HTTP 4xx/5xx
            audio_content = response.content

        # Whisper API attend un objet fichier, donc nous sauvegardons temporairement le contenu téléchargé
        # tempfile.NamedTemporaryFile crée un fichier qui est supprimé à sa fermeture
        with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as tmp_audio_file: # Assurez-vous que le suffixe correspond au format audio attendu par Whisper ou que Whisper peut le gérer
            tmp_audio_file.write(audio_content)
            tmp_audio_file.flush() # S'assurer que toutes les données sont écrites
            tmp_audio_file.seek(0) # Rembobiner au début du fichier pour la lecture
            
            # Lire le fichier temporaire pour l'envoyer à Whisper
            # Le client OpenAI s'attend à un objet fichier ouvert en mode binaire ('rb')
            with open(tmp_audio_file.name, "rb") as audio_for_whisper:
                transcription_response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_for_whisper,
                    response_format="text" # ou "json", "verbose_json", etc.
                )
        
        # La réponse pour le format "text" est directement la chaîne de transcription
        if isinstance(transcription_response, str):
            return transcription_response.strip()
        else:
            # Si le format de réponse est différent (ex: json), ajustez l'extraction ici
            # Pour l'instant, on s'attend à du texte brut.
            print(f"Réponse inattendue de Whisper: {transcription_response}")
            return "Erreur lors de l'extraction de la transcription."

    except httpx.HTTPStatusError as e:
        print(f"Erreur HTTP lors du téléchargement du fichier audio: {e.response.status_code} - {e.response.text}")
        # Lever une HTTPException pour que FastAPI la gère proprement
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Impossible de télécharger le fichier audio depuis l'URL fournie: {e.response.status_code}"
        )
    except openai.APIError as e:
        print(f"Erreur API OpenAI: {e}")
        # Lever une HTTPException
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Erreur lors de la communication avec l'API OpenAI pour la transcription: {e.message}"
        )
    except Exception as e:
        print(f"Erreur inattendue lors de la transcription audio: {e}")
        # Lever une HTTPException pour les autres erreurs
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Une erreur interne est survenue lors de la tentative de transcription de l'audio."
        )

# Vous pourriez ajouter ici une fonction pour utiliser GPT-4 pour résumer ou analyser la transcription
# async def analyze_transcription_with_gpt4(transcription: str) -> str | None:
#     if not settings.OPENAI_API_KEY:
#         return "Analyse non disponible (clé API OpenAI manquante)."
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4-turbo-preview", # ou un autre modèle GPT-4
#             messages=[
#                 {"role": "system", "content": "Vous êtes un assistant qui résume des transcriptions audio."},
#                 {"role": "user", "content": f"Voici une transcription à résumer : \n\n{transcription}"}
#             ]
#         )
#         return response.choices[0].message.content.strip()
#     except openai.APIError as e:
#         print(f"Erreur API OpenAI (GPT-4): {e}")
#         raise HTTPException(
#             status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
#             detail=f"Erreur lors de la communication avec l'API OpenAI pour l'analyse GPT-4: {e.message}"
#         )
#     except Exception as e:
#         print(f"Erreur inattendue lors de l'analyse GPT-4: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Une erreur interne est survenue lors de l'analyse GPT-4."
#         )

