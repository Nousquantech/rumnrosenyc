
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import init_db
from app.routes.chat import router as chat_router
from app.routes.memory import router as memory_router
from app.routes.products import router as products_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup Logic ---
    # Phase 1 requirement: create tables via Base.metadata.create_all().
    init_db()

    yield  # The app runs while this is suspended

    # --- Shutdown Logic (if needed) ---
    # e.g., close database connections, clear caches
    pass


def create_app() -> FastAPI:
    # Pass the lifespan context manager into the FastAPI constructor
    app = FastAPI(
        title="Rum&Rose API",
        version="1.0.0",
        lifespan=lifespan
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Error Handling Middleware
    @app.middleware("http")
    async def _error_middleware(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception:
            # Note: In production, log the actual error here!
            return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    # Include Routers
    app.include_router(chat_router)
    app.include_router(memory_router)
    app.include_router(products_router)

    return app


app = create_app()
