"""
AETHER Climate Context & Anomaly API Router
"""
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.climate_schema import ClimateContextResponse
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/climate", tags=["Climate Context"])


@router.get("", response_model=ClimateContextResponse)
def get_climate_context(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    var: str = Query("rainfall_mm", description="Variable (rainfall_mm, temperature_c, wind_speed_ms)"),
    location_name: str = Query("Delhi NCR", description="Location name"),
    current_val: Optional[float] = Query(None, description="Optional custom current value")
):
    """
    Returns 30-year climatological normal baseline envelope and calculates current anomalies.
    """
    return aether_service.get_climate_context(
        lat=lat,
        lon=lon,
        variable=var,
        current_value=current_val,
        location_name=location_name
    )
