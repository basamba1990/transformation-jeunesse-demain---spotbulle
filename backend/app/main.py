from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

# Importation explicite des modèles SQLAlchemy
# Cette ligne est cruciale pour résoudre l'erreur "name 'Pod' is not defined"
from app.models import User, Profile, Pod

# Importation des routes
from app.routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes, video_routes

# Configuration initiale
limiter = Limiter(key_func=get_remote_address)

# Initialisation de la base de données (ajout recommandé)
from app.database import Base, engine
# Création des tables si elles n'existent pas
Base.metadata.create_all(bind=engine)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://spotbulle-front-end.onrender.com",
        "https://spotbulle-backend-tydv.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"]
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(EnhancedSecurityHeadersMiddleware)

@app.get("/")
async def root_endpoint():
    return {"message": "API Spotbulle opérationnelle", "version": app.version}

@app.get("/health")
async def health_check():
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

# Alternative: utiliser un événement de démarrage FastAPI
# @app.on_event("startup")
# async def startup_db_client():
#     # Cette fonction s'exécute au démarrage de l'application
#     # Assurez-vous que les modèles sont importés et que la base de données est initialisée
#     from .models import User, Profile, Pod
#     from .database import Base, engine
#     Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV") == "development",
        log_config=None
    )
