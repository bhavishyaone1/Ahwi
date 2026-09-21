"""
AETHER Forecast API Router
"""
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.forecast_schema import BlendedForecastResponse
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("", response_model=BlendedForecastResponse)
def get_point_forecast(
    lat: float = Query(28.6139, description="Latitude (default Delhi NCR)"),
    lon: float = Query(77.2090, description="Longitude"),
    var: str = Query("rainfall_mm", description="Variable: rainfall_mm, temperature_c, wind_speed_ms"),
    horizon: int = Query(24, description="Forecast horizon in hours (6, 12, 24, 48, 72)"),
    location_name: Optional[str] = Query("Delhi NCR", description="Location identifier")
):
    """
    Returns the AETHER hybrid blended forecast, confidence, model trust, and detected regime.
    Every number is calculated through the active ML pipeline.
    """
    return aether_service.get_forecast_for_location(
        lat=lat,
        lon=lon,
        variable=var,
        lead_time_hours=horizon,
        location_name=location_name
    )
