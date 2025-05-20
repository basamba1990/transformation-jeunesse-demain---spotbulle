import os
import tempfile
import subprocess
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models.pod_model import Pod
from ..config import settings
from . import transcription_service

async def transcribe_pod(db: Session, pod_id: int, audio_url: str) -> Pod:
    """
    Transcrit un fichier audio d'un Pod et met à jour la base de données
    """
    try:
        # Appel au service de transcription
        transcription = await transcription_service.transcribe_audio_with_whisper(audio_url)
        
        # Mise à jour du Pod en base de données
        pod = db.query(Pod).filter(Pod.id == pod_id).first()
        if not pod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod introuvable")
        
        pod.transcription = transcription
        db.commit()
        db.refresh(pod)
        
        return pod
    
    except HTTPException as e:
        # Rediffuser les exceptions HTTP
        raise e
    except Exception as e:
        # Gérer les autres exceptions
        print(f"Erreur lors de la transcription du Pod {pod_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la transcription du Pod"
        )

async def extract_audio_from_video(video_file_path: str) -> str:
    """
    Extrait la piste audio d'un fichier vidéo et retourne le chemin du fichier audio
    """
    try:
        # Créer un fichier temporaire pour l'audio extrait
        audio_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        audio_file_path = audio_file.name
        audio_file.close()
        
        # Utiliser ffmpeg pour extraire l'audio
        command = [
            "ffmpeg",
            "-i", video_file_path,
            "-q:a", "0",
            "-map", "a",
            "-f", "mp3",
            audio_file_path
        ]
        
        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        
        return audio_file_path
    
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'extraction audio avec ffmpeg: {e.stderr}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'extraction audio du fichier vidéo"
        )
    except Exception as e:
        print(f"Erreur inattendue lors de l'extraction audio: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur inattendue lors de l'extraction audio"
        )
