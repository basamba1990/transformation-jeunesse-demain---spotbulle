from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware # Déjà implicitement géré par FastAPI mais peut être configuré explicitement

from .routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialiser le limiteur de taux
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="spotbulle-mvp API",
    description="API pour le projet spotbulle-mvp.",
    version="0.2.3", # Version incrémentée pour refléter les améliorations de sécurité
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Appliquer le décorateur de limiteur à l'application
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware pour les en-têtes de sécurité
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        # CSP est complexe et doit être adapté. Ceci est une base restrictive.
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; " # 'unsafe-inline' est souvent nécessaire pour Swagger UI, à affiner
            "style-src 'self' 'unsafe-inline'; "  # Idem pour les styles
            "img-src 'self' data:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "base-uri 'self'"
        )
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions-Policy peut être ajouté ici si nécessaire, ex: "geolocation=(), microphone=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Configuration CORS (si nécessaire, ajuster les origines autorisées)
# FastAPI a une gestion CORS par défaut, mais pour plus de contrôle:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # À restreindre en production (ex: ["http://localhost:3000", "https://votre-domaine-frontend.com"])
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
@limiter.limit("5/minute") # Exemple de limite de taux sur une route spécifique
async def read_root(request: Request):
    return {"message": "Bienvenue sur l’API spotbulle-mvp"}

# Inclure les routeurs
# Appliquer des limites de taux plus strictes sur les routes sensibles comme login/register
app.include_router(auth_routes.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(user_routes.router, prefix="/api/v1", tags=["Users"])
app.include_router(pod_routes.router, prefix="/api/v1", tags=["Pods"])
app.include_router(profile_routes.router, prefix="/api/v1", tags=["Profiles"])
app.include_router(ia_routes.router, prefix="/api/v1", tags=["IA"])


# Les limites de taux pour les routeurs auth_routes peuvent être définies dans auth_routes.py
# Exemple pour auth_routes.py:
# from fastapi import APIRouter
# from slowapi import Limiter
# from slowapi.util import get_remote_address
# limiter = Limiter(key_func=get_remote_address)
# router = APIRouter()
# @router.post("/token")
# @limiter.limit("5/minute")
# async def login_for_access_token(...): ...


# Pour exécuter l’application localement:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

