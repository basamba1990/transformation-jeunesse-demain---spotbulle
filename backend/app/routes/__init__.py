"""
Fichier d'initialisation pour le module routes.
Importe tous les routeurs pour les rendre disponibles lors de l'initialisation de l'application.
"""

from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.pod_routes import router as pod_router
from app.routes.profile_routes import router as profile_router
from app.routes.ia_routes import router as ia_router
from app.routes.video_routes import router as video_router

# Exporte tous les routeurs pour qu'ils soient accessibles via routes.*
__all__ = [
    "auth_router",
    "user_router", 
    "pod_router", 
    "profile_router", 
    "ia_router", 
    "video_router"
]
