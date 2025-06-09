# backend/app/main_compatible.py
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import HTTPException
import os
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("spotbulle-api")

# Importation des routes compatibles
from .routes import auth_routes_compatible, pod_routes_compatible, matches_routes_compatible

# Configuration initiale
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="SpotBulle API Compatible",
    description="API compatible avec le frontend SpotBulle",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

class EnhancedSecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": "default-src 'self'",
            "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        response.headers.update(security_headers)
        return response

# Configuration CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://spotbulle-intelligent.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"]
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(EnhancedSecurityHeadersMiddleware)

# Créer le dossier static s'il n'existe pas
os.makedirs("./static/media", exist_ok=True)
os.makedirs("./static/audio", exist_ok=True)
os.makedirs("./static/avatars", exist_ok=True)

# Monter le dossier static pour servir les fichiers
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root_endpoint():
    logger.info("Root endpoint called")
    return {
        "message": "API Spotbulle opérationnelle",
        "version": app.version,
        "status": "compatible",
        "endpoints": {
            "auth": "/api/v1/auth/*",
            "pods": "/api/v1/pods/*",
            "matches": "/api/v1/matches/*"
        }
    }

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok", "version": app.version}

# Inclusion des routes compatibles
API_PREFIX = "/api/v1"

app.include_router(
    auth_routes_compatible.router,
    prefix=API_PREFIX,
    tags=["Authentication"]
)

app.include_router(
    pod_routes_compatible.router,
    prefix=API_PREFIX,
    tags=["Pods"]
)

app.include_router(
    matches_routes_compatible.router,
    prefix=API_PREFIX,
    tags=["Matches"]
)

# Routes additionnelles pour compatibilité
@app.get("/api/v1/videos")
async def get_videos():
    """Service vidéo (stub)"""
    return []

@app.get("/api/v1/transcription")
async def get_transcriptions():
    """Service transcription (stub)"""
    return []

@app.get("/api/v1/disc/profile")
async def get_disc_profile():
    """Profil DISC (stub)"""
    return {
        "user_id": 1,
        "dominant_type": "D",
        "scores": {"D": 85, "I": 70, "S": 60, "C": 45},
        "description": "Profil Dominant - Leader naturel"
    }

# Gestion d'erreurs
@app.exception_handler(404)
def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint non trouvé"}
    )

@app.exception_handler(500)
def internal_error_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur serveur interne"}
    )

# Log de démarrage
logger.info(f"Application FastAPI compatible initialisée, version {app.version}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Démarrage du serveur compatible sur {host}:{port}")
    uvicorn.run(
        "app.main_compatible:app",
        host=host,
        port=port,
        reload=os.getenv("ENV") == "development",
        log_config=None
    )

