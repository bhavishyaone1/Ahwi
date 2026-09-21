"""
AETHER Explainability & SHAP Feature Attribution API Router
"""
from fastapi import APIRouter, Query
from backend.app.schemas.explanation_schema import ModelExplanationResponse
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/explanation", tags=["Explainability"])


@router.get("", response_model=ModelExplanationResponse)
def get_model_explanation(
    model: str = Query("ECMWF_AIFS", description="Model to explain (ECMWF_IFS, ECMWF_AIFS, GFS)"),
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    var: str = Query("rainfall_mm", description="Variable"),
    horizon: int = Query(24, description="Horizon (6, 12, 24, 48, 72)"),
    location_name: str = Query("Delhi NCR", description="Location name")
):
    """
    Returns SHAP feature contributions explaining why AETHER assigned a particular weight.
    """
    return aether_service.get_model_explanation(
        model=model,
        lat=lat,
        lon=lon,
        variable=var,
        lead_time_hours=horizon,
        location_name=location_name
    )
