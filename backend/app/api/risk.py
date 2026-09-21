"""
AETHER Extreme Weather Risk API Router
"""
from fastapi import APIRouter, Query
from backend.app.schemas.risk_schema import ExtremeRiskAssessment
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/risk", tags=["Extreme Risk"])


@router.get("", response_model=ExtremeRiskAssessment)
def get_extreme_risk(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    horizon: int = Query(24, description="Horizon"),
    location_name: str = Query("Delhi NCR", description="Location name")
):
    """
    Returns probabilistic risk output for Heavy Rain, Heat, and High Wind.
    Includes mandatory disclaimer distinguishing model risk from official IMD warnings.
    """
    return aether_service.get_extreme_risk(
        lat=lat,
        lon=lon,
        lead_time_hours=horizon,
        location_name=location_name
    )
