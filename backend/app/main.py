from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from .routes import auth_routes, user_routes, pod_routes, profile_routes, ia_routes, video_routes

# Configuration initiale
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="spotbulle-mvp API",
    description="API pour le projet spotbulle-mvp.",
    version="0.3.1",  # Augmentation de version pour l'ajout de la fonctionnalitÃ© vidÃ©o
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# Middleware de sÃ©curitÃ© amÃ©liorÃ©
class EnhancedSecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": "default-src 'self'",  # SimplifiÃ©
            "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        response.headers.update(security_headers)
        return response

# Configuration CORS unique
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"]
)

# Configuration du rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(EnhancedSecurityHeadersMiddleware)

# Endpoints de base
@app.get("/")
async def root_endpoint():
    return {"message": "API Spotbulle opÃ©rationnelle", "version": app.version}

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": app.version}

# Configuration des routes corrigÃ©e
API_PREFIX = "/api/v1"

route_config = [
    (auth_routes.router, "/auth", ["Authentication"]),
    (user_routes.router, "/users", ["Users"]),
    (pod_routes.router, "/pods", ["Pods"]),
    (profile_routes.router, "/profiles", ["Profiles"]),
    (ia_routes.router, "/ia", ["IA"]),
    (video_routes.router, "/videos", ["Videos"])  # Ajout du nouveau router pour les vidÃ©os
]

for router, path, tags in route_config:
    app.include_router(
        router,
        prefix=f"{API_PREFIX}{path}",
        tags=tags
    )

# Configuration serveur
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV") == "development",
        log_config=None
    )
