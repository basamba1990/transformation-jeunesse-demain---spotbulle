from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import os
from .routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes

# Liste des IP de confiance
TRUSTED_IPS = {"127.0.0.1", "10.200.27.12"}  # à adapter selon le contexte

# Initialiser le limiteur de taux
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="spotbulle-mvp API",
    description="API pour le projet spotbulle-mvp.",
    version="0.2.3",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
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
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "base-uri 'self';"
        )
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Route racine avec protection IP (optionnel)
@app.get("/")
@limiter.limit("30/minute")
async def read_root(request: Request):
    client_ip = request.client.host
    print(f"Requête depuis l'IP : {client_ip}")  # Log simple
    if os.getenv("ENV") == "production" and client_ip not in TRUSTED_IPS:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    return {"message": "Bienvenue sur l’API spotbulle-mvp"}

# Endpoint de santé
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Inclusion des routeurs avec préfixe
app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(user_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(pod_routes.router, prefix="/api/v1/pods", tags=["Pods"])
app.include_router(profile_routes.router, prefix="/api/v1/profiles", tags=["Profiles"])
app.include_router(ia_routes.router, prefix="/api/v1/ia", tags=["IA"])

# Point d'entrée local (inutile pour Render)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
