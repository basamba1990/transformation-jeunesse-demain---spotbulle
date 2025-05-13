from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from .routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes

# Configuration du limiteur de taux
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="spotbulle-mvp API",
    description="API pour le projet spotbulle-mvp.",
    version="0.2.3",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# Configuration de la sécurité
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "font-src 'self'; "
                "object-src 'none'; "
                "frame-ancestors 'none';"
            ),
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        for header, value in security_headers.items():
            response.headers[header] = value
        return response

# Configuration CORS élargie
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"]
)

# Configuration globale du limiteur
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(SecurityHeadersMiddleware)

# Endpoints de base
@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Spotbulle"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Inclusion des routeurs
route_config = [
    (auth_routes.router, "/auth"),
    (user_routes.router, "/users"),
    (pod_routes.router, "/pods"),
    (profile_routes.router, "/profiles"),
    (ia_routes.router, "/ia")
]

for router, path in route_config:
    app.include_router(
        router,
        prefix=f"/api/v1{path}",
        tags=[router.tags[0] if router.tags else "Non catégorisé"]
    )

# Point d'entrée pour le déploiement
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV") == "development"
    )
