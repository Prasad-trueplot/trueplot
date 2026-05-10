from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import agents, ai_summaries, auth, documents, health, properties
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="TRUEPLOT MVP API",
        version="0.1.0",
        description="Local development API foundation for TRUEPLOT MVP.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(agents.router)
    app.include_router(properties.router)
    app.include_router(documents.router)
    app.include_router(ai_summaries.router)

    return app


app = create_app()
