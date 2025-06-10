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

# Importation explicite des modèles SQLAlchemy
try:
    from .models import User, Profile, Pod
except ImportError:
    logger.warning("Impossible d'importer les modèles - mode démo activé")

# Importation des routes
try:
    from .routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes, video_routes
except ImportError:
    logger.warning("Impossible d'importer toutes les routes - utilisation des routes de base")

# Configuration initiale
limiter = Limiter(key_func=get_remote_address)

# Initialisation de la base de données (avec gestion d'erreur)
try:
    from .database import Base, engine
    logger.info("Initialisation des tables de la base de données...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables initialisées avec succès")
except Exception as e:
    logger.error(f"Erreur lors de l'initialisation des tables: {e}")

app = FastAPI(
    title="spotbulle-mvp API",
    description="API pour le projet spotbulle-mvp.",
    version="0.3.1",
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

class LargeFileUploadMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 209715200:  # 200 Mo
            return JSONResponse(
                status_code=413,
                content={"detail": "Taille du fichier trop importante"}
            )
        return await call_next(request)

class AuthenticationErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            if e.status_code == 401:
                logger.warning(f"Erreur d'authentification: {e.detail}")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Authentification requise pour accéder à cette ressource"}
                )
            raise e

# Ajout des middlewares
app.add_middleware(LargeFileUploadMiddleware)
app.add_middleware(AuthenticationErrorMiddleware)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://spotbulle-intelligent.vercel.app",
        "https://spotbulle-mentor.onrender.com",
        "https://spotbulle-backend-0lax.onrender.com",
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

# Créer les dossiers nécessaires
os.makedirs("./static/media", exist_ok=True)
os.makedirs("./static/audio", exist_ok=True)
os.makedirs("./static/avatars", exist_ok=True)

# Monter le dossier static
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root_endpoint():
    logger.info("Root endpoint called")
    return {"message": "API Spotbulle opérationnelle", "version": app.version}

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok", "version": app.version}

# Routes de base pour compatibilité frontend - SUPPRIMÉES EN MODE PROFESSIONNEL
# Les vraies routes sont dans les modules séparés

# Inclusion des routes si disponibles
API_PREFIX = "/api/v1"

try:
    route_config = [
        (auth_routes.router, "", ["Authentication"]),
        (user_routes.router, "", ["Users"]),
        (pod_routes.router, "", ["Pods"]),
        (profile_routes.router, "", ["Profiles"]),
        (ia_routes.router, "", ["IA"]),
        (video_routes.router, "", ["Videos"])
    ]

    for router, path, tags in route_config:
        app.include_router(
            router,
            prefix=f"{API_PREFIX}{path}",
            tags=tags
        )
except Exception as e:
    logger.warning(f"Impossible d'inclure toutes les routes: {e}")

# Gestion d'erreurs
@app.exception_handler(404)
def not_found(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint non trouvé"}
    )

@app.exception_handler(500)
def internal_error(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur serveur interne"}
    )

logger.info(f"Application FastAPI initialisée avec succès, version {app.version}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Démarrage du serveur Uvicorn sur {host}:{port}")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("ENV") == "development",
        log_config=None,
        limit_concurrency=100,
        limit_max_requests=10000,
        timeout_keep_alive=120
    )

