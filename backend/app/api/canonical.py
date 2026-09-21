"""
AETHER Canonical Intelligence API Router
Single Source of Truth serving the unified meteorological forecast object.
"""
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.canonical_schema import CanonicalForecastResponse
from backend.app.services.aether_service import aether_service

router = APIRouter(tags=["Canonical Intelligence"])


@router.get("/canonical", response_model=CanonicalForecastResponse)
def get_canonical_forecast(
    lat: float = Query(28.6139, description="Latitude (default Delhi NCR)"),
    lon: float = Query(77.2090, description="Longitude"),
    var: str = Query("rainfall_mm", description="Variable: rainfall_mm, temperature_c, wind_speed_ms"),
    horizon: int = Query(24, description="Forecast horizon in hours (6, 12, 24, 48, 72)"),
    location_name: Optional[str] = Query("Delhi NCR", description="Location identifier")
):
    """
    Returns the unified single-source-of-truth canonical forecast response.
    All 8 screens consume this exact object for zero-discrepancy consistency.
    """
    return aether_service.get_canonical_forecast(
        lat=lat,
        lon=lon,
        variable=var,
        lead_time_hours=horizon,
        location_name=location_name
    )


@router.get("/canonical/{lat}/{lon}", response_model=CanonicalForecastResponse)
def get_canonical_forecast_by_coord(
    lat: float,
    lon: float,
    var: str = Query("rainfall_mm", description="Variable: rainfall_mm, temperature_c, wind_speed_ms"),
    horizon: int = Query(24, description="Forecast horizon in hours"),
    location_name: Optional[str] = Query("Selected Location", description="Location identifier")
):
    return aether_service.get_canonical_forecast(
        lat=lat,
        lon=lon,
        variable=var,
        lead_time_hours=horizon,
        location_name=location_name
    )


@router.get("/trace")
def get_forecast_trace(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    var: str = Query("rainfall_mm", description="Variable"),
    horizon: int = Query(24, description="Forecast horizon in hours"),
    location_name: Optional[str] = Query("Delhi NCR", description="Location identifier")
):
    """Returns step-by-step pipeline execution trace for the Forecast Trace drawer."""
    return aether_service.get_forecast_trace(
        lat=lat,
        lon=lon,
        variable=var,
        lead_time_hours=horizon,
        location_name=location_name
    )
