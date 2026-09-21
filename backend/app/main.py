"""
AETHER FastAPI Application Entrypoint
MoES / NCMRWF Problem Statement 26081: Hybrid AI–NWP Multi-Model Forecast Blending System
"""
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.benchmark import router as benchmark_router
from backend.app.api.canonical import router as canonical_router
from backend.app.api.climate import router as climate_router
from backend.app.api.explanation import router as explanation_router
from backend.app.api.forecast import router as forecast_router
from backend.app.api.models import router as models_router
from backend.app.api.query import router as query_router
from backend.app.api.risk import router as risk_router
from backend.app.api.weights import router as weights_router
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.services.aether_service import aether_service

app = FastAPI(
    title=settings.APP_NAME,
    description="Adaptive Hybrid Weather Intelligence & Multi-Model Forecast Blending System",
    version="1.0.0",
    docs_url=f"{settings.API_PREFIX}/docs",
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

# CORS Middleware allowing Next.js local frontend and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Initializes database tables on application start."""
    init_db()


@app.get(f"{settings.API_PREFIX}/status", tags=["System"])
def get_system_status():
    """
    Returns live operational status, active data mode (REAL or DEMO), and grid info.
    Frontend uses this to drive the status indicator pill.
    """
    return {
        "status": "OPERATIONAL",
        "app_name": settings.APP_NAME,
        "data_mode": aether_service.adapter.get_mode(),
        "data_source": aether_service.adapter.get_source_name(),
        "target_grid_resolution": f"{settings.TARGET_GRID_RESOLUTION}° (~27 km)",
        "active_models": ["ECMWF_IFS", "ECMWF_AIFS", "GFS"],
        "timestamp_utc": datetime.utcnow().isoformat() + "Z"
    }


# Include all modular routers
app.include_router(canonical_router, prefix=settings.API_PREFIX)
app.include_router(forecast_router, prefix=settings.API_PREFIX)
app.include_router(models_router, prefix=settings.API_PREFIX)
app.include_router(weights_router, prefix=settings.API_PREFIX)
app.include_router(risk_router, prefix=settings.API_PREFIX)
app.include_router(climate_router, prefix=settings.API_PREFIX)
app.include_router(explanation_router, prefix=settings.API_PREFIX)
app.include_router(query_router, prefix=settings.API_PREFIX)
app.include_router(benchmark_router, prefix=settings.API_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
