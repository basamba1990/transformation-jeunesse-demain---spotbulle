from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("spotbulle-api")

# Importation explicite des modèles SQLAlchemy
# Cette ligne est cruciale pour résoudre l'erreur "name 'Pod' is not defined"
from .models import User, Profile, Pod

# Importation des routes
from .routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes, video_routes

# Configuration initiale
limiter = Limiter(key_func=get_remote_address)

# Initialisation de la base de données (ajout recommandé)
from .database import Base, engine
# Création des tables si elles n'existent pas
try:
    logger.info("Initialisation des tables de la base de données...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables initialisées avec succès")
except Exception as e:
    logger.error(f"Erreur lors de l'initialisation des tables: {e}")
    # Ne pas lever d'exception ici pour permettre à l'application de démarrer même si la BD n'est pas prête

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

# Middleware modifié pour gérer la taille des fichiers volumineux
class LargeFileUploadMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_body_size=None):
        super().__init__(app)
        self.max_body_size = max_body_size
        
    async def dispatch(self, request: Request, call_next):
        # Vérification optionnelle de la taille du corps de la requête
        content_length = request.headers.get("content-length")
        if content_length and self.max_body_size:
            if int(content_length) > self.max_body_size:
                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Taille du fichier trop importante"}
                )
        return await call_next(request)

# Log des variables d'environnement importantes (sans les valeurs sensibles)
logger.info(f"PORT environment variable: {os.getenv('PORT', '8000')}")
logger.info(f"HOST environment variable: {os.getenv('HOST', '0.0.0.0')}")
logger.info(f"Environment mode: {os.getenv('ENV', 'production')}")

# Configuration CORS avec plus d'origines autorisées
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://spotbulle-front-end.onrender.com",
        "https://spotbulle-backend-tydv.onrender.com",
        # Ajout d'origines supplémentaires si nécessaire
        "*"  # Temporairement autoriser toutes les origines pour le débogage
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"]
)

# Ajout du middleware pour les fichiers volumineux avec la syntaxe corrigée
app.add_middleware(
    LargeFileUploadMiddleware,
    max_body_size=209715200  # 200 Mo en octets
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(EnhancedSecurityHeadersMiddleware)

@app.get("/")
async def root_endpoint():
    logger.info("Root endpoint called")
    return {"message": "API Spotbulle opérationnelle", "version": app.version}

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok", "version": app.version}

API_PREFIX = "/api/v1"

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

# Log de démarrage de l'application
logger.info(f"Application FastAPI initialisée avec succès, version {app.version}")

# Configuration de Uvicorn pour accepter les fichiers volumineux
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
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
        timeout_keep_alive=120,  # Augmentation du timeout pour les connexions persistantes
        # Configuration alternative pour les fichiers volumineux via Uvicorn
        # http={'max_request_size': 209715200}  # 200 Mo en octets
    )
