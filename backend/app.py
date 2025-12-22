from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from config.settings import get_settings
from controllers.agent_controller import router as agent_router
from controllers.course_controller import router as course_router
from controllers.health_controller import router as health_router
from controllers.user_controller import router as user_router


def create_app() -> FastAPI:
    
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
    )

    # CORS
    origins = [
        "http://localhost:5173",
        settings.frontend_url,
        "https://localhost:5173",
        "https://wp1141-finals.web.app"
    ]
    
    # Required for Authlib/OAuth to handle state and redirects
    # Configure cookie security based on environment
    is_production = settings.app_env.lower() == "production"
    
    app.add_middleware(
        SessionMiddleware, 
        secret_key=settings.auth_secret_key,
        https_only=True,
        same_site="none",
        session_cookie="__session",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Trust headers from load balancers (e.g., Cloud Run)
    # This ensures request.url_for() generates https links when running behind TLS termination
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(user_router, prefix=settings.api_prefix)
    app.include_router(course_router, prefix=settings.api_prefix)
    app.include_router(agent_router, prefix=settings.api_prefix)
    return app


app = create_app()
