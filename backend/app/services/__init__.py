"""
Fichier d'initialisation pour le module services.
Importe tous les services pour les rendre disponibles lors de l'initialisation de l'application.
"""

from ..disc_service import *
from ..ia_service import *
from ..pod_service import *
from ..profile_service import *
from ..storage_service import *
from ..transcription_service import *
from ..user_service import *
from ..video_service import *

# Liste des services exportés
__all__ = [
    # Disc services
    "process_disc_assessment",
    "get_disc_profile",
    
    # IA services
    "generate_ia_response",
    "process_ia_prompt",
    
    # Pod services
    "create_pod",
    "get_pod",
    "get_pods",
    "update_pod",
    "delete_pod",
    
    # Profile services
    "create_profile",
    "get_profile",
    "get_profile_by_user_id",
    "update_profile",
    "delete_profile",
    
    # Storage services
    "upload_file",
    "get_file_url",
    "delete_file",
    
    # Transcription services
    "transcribe_audio",
    "process_transcription",
    
    # User services
    "get_user",
    "get_user_by_email",
    "get_users",
    "create_user",
    "update_user",
    "delete_user",
    "authenticate_user",
    
    # Video services
    "process_video",
    "generate_video_url"
]
