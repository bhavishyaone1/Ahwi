"""
AETHER Forecast & Meteorological Schemas
Strict Pydantic models ensuring data integrity and zero silent fallbacks.
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ForecastRecord(BaseModel):
    """A standardized single forecast record from any NWP/AI source."""
    timestamp: datetime = Field(..., description="Target validity time (UTC)")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    model: str = Field(..., description="Forecast model identifier (e.g., ECMWF_IFS, ECMWF_AIFS, GFS, NCUM)")
    variable: str = Field(..., description="Variable (rainfall_mm, temperature_c, wind_speed_ms)")
    lead_time_hours: int = Field(..., ge=0, le=240, description="Forecast lead time horizon in hours")
    value: float = Field(..., description="Predicted numerical value")
    pressure_hpa: Optional[float] = Field(default=None, description="Atmospheric pressure if available, never silently substituted")
    humidity_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Relative humidity if available")
    data_mode: str = Field(default="REAL", description="'REAL' or 'DEMO'")
    data_source: str = Field(default="ECMWF_OPEN_DATA", description="Source identifier e.g., 'SYNTHETIC_SCENARIO' in demo mode")

    @field_validator("data_mode")
    def validate_mode(cls, v: str) -> str:
        if v not in ("REAL", "DEMO"):
            raise ValueError("data_mode must be either 'REAL' or 'DEMO'")
        return v


class ObservationRecord(BaseModel):
    """Ground truth observation record from IMD or ERA5."""
    timestamp: datetime = Field(..., description="Observation valid time (UTC)")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    variable: str = Field(..., description="rainfall_mm, temperature_c, wind_speed_ms")
    actual_value: float = Field(..., description="Observed measurement value")
    source: str = Field(..., description="IMD_GRIDDED, ERA5, or SYNTHETIC_SCENARIO")
    data_mode: str = Field(default="REAL", description="'REAL' or 'DEMO'")


class ModelPerformanceRecord(BaseModel):
    """Historical model error tracking record stored in the performance store."""
    model: str
    region_id: str
    variable: str
    season: str = Field(..., description="MONSOON, POST_MONSOON, WINTER, PRE_MONSOON")
    lead_time_hours: int
    weather_regime: str = Field(..., description="NORMAL, HEAVY_RAIN, HEAT, HIGH_WIND, DRY, EXTREME")
    mae: float = Field(..., ge=0.0)
    rmse: float = Field(..., ge=0.0)
    bias: float
    skill_score: float
    sample_count: int = Field(..., ge=1)
    updated_at: datetime
    data_mode: str = Field(default="REAL")


class ModelWeightOutput(BaseModel):
    """Model weights computed for a specific forecast instance."""
    timestamp: datetime
    latitude: float
    longitude: float
    variable: str
    lead_time_hours: int
    weights: Dict[str, float] = Field(..., description="Mapping of model -> normalized weight summing to 1.0")
    detected_regime: str
    regime_confidence: float
    data_mode: str
    data_source: str


class BlendedForecastResponse(BaseModel):
    """Complete AETHER hybrid forecast response for a point/subdivision."""
    location_name: str
    latitude: float
    longitude: float
    target_time: datetime
    variable: str
    lead_time_hours: int
    raw_blend: float
    calibrated_forecast: float
    bias_correction: float
    confidence_pct: float = Field(..., ge=0.0, le=100.0)
    confidence_tier: str = Field(..., description="'High', 'Moderate', 'Low'")
    confidence_drivers: List[str]
    dominant_model: str
    model_weights: Dict[str, float]
    raw_model_forecasts: Dict[str, float]
    spread: float
    detected_regime: str
    regime_probabilities: Dict[str, float]
    data_mode: str
    data_source: str
