"""
AETHER Climate Context & Anomaly Schemas
Relates current forecasts to long-term 30-year climatological baselines.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ClimatologicalBaselinePoint(BaseModel):
    day_of_year: int
    mean_value: float
    std_dev: float
    p10: float
    p90: float


class ClimateContextResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    variable: str
    current_forecast_value: float
    climatological_baseline_mean: float
    climatological_baseline_std: float
    anomaly_absolute: float = Field(..., description="Forecast value - Climatological Mean")
    anomaly_percentage: float = Field(..., description="((Forecast - Mean) / Mean) * 100")
    percentile: float = Field(..., ge=0.0, le=100.0, description="Where current forecast ranks in historical distribution")
    historical_trend_summary: str
    envelope: List[ClimatologicalBaselinePoint]
    data_mode: str = "REAL"
    data_source: str = "AETHER_CLIMATOLOGY_ENGINE"
