"""
Fichier d'initialisation pour le module schemas.
Importe tous les schémas pour les rendre disponibles lors de l'initialisation de l'application.
"""

from ..disc_schema import *
from ..ia_schema import *
from ..pod_schema import *
from ..profile_schema import *
from ..token_schema import *
from ..user_schema import *

# Liste explicite des classes et fonctions exportées
__all__ = [
    # Disc schemas
    "DiscAssessment",
    "DiscResult",
    
    # IA schemas
    "IAPrompt",
    "IAResponse",
    
    # Pod schemas
    "PodBase",
    "PodCreate",
    "PodUpdate",
    "PodInDB",
    "Pod",
    
    # Profile schemas
    "ProfileBase",
    "ProfileCreate",
    "ProfileUpdate",
    "ProfileInDB",
    "Profile",
    
    # Token schemas
    "Token",
    "TokenData",
    
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "User"
]
