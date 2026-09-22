"""
Canonical Forecast Object Schema
Single Source of Truth for AETHER Meteorological Intelligence.
All 8 screens consume this exact canonical structure to ensure 100% numerical consistency.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class LocationInfo(BaseModel):
    name: str = Field(..., examples=["Delhi NCR"])
    latitude: float = Field(..., examples=[28.6139])
    longitude: float = Field(..., examples=[77.2090])
    region: str = Field("North India", examples=["North India"])


class DataFreshness(BaseModel):
    ECMWF: str = "Updated 18 min ago"
    AIFS: str = "Updated 18 min ago"
    GFS: str = "Updated 25 min ago"
    NASA_GPM: str = "Updated 32 min ago"
    INSAT_3D: str = "Updated 15 min ago"
    ERA5: str = "Historical baseline (1995-2024)"


class AetherForecastOutput(BaseModel):
    raw_blend: float = Field(..., description="Softmax weighted multi-model blend before calibration")
    calibrated_value: float = Field(..., description="Variable-specific regional bias calibrated forecast")
    bias_applied: float = Field(0.0, description="Amount of bias calibration applied")
    unit: str = Field("mm", description="Measurement unit (mm, °C, m/s)")


class ConfidenceOutput(BaseModel):
    pct: int = Field(..., ge=0, le=100, description="Calibrated confidence percentage")
    tier: str = Field(..., description="HIGH, MEDIUM, LOW")
    drivers: List[str] = Field(default_factory=list, description="Empirical factors governing confidence")


class WeatherRegimeOutput(BaseModel):
    detected: str = Field(..., description="Detected regime (HEAVY_RAIN, NORMAL, HEAT, etc.)")
    probabilities: Dict[str, float] = Field(..., description="Probabilities for all synoptic regimes")


class ObservationVerification(BaseModel):
    source: str = Field("NASA GPM IMERG / INSAT-3D", description="Connected observation source")
    recent_observation_value: Optional[float] = Field(None, description="Latest verified satellite/ground observation")
    deviation_from_forecast: Optional[float] = Field(None, description="Forecast minus latest observation")
    satellite_agreement: str = Field("HIGH", description="HIGH, MODERATE, LOW agreement")
    observation_conditioned_signal: str = Field(..., description="Short-lead reliability signal")


class MonthlyClimateEnvelope(BaseModel):
    month: str
    normal: float
    min_range: float
    max_range: float


class ClimateContextOutput(BaseModel):
    climate_normal: float
    anomaly: float
    anomaly_pct: float
    percentile: int
    temp_anomaly_c: float
    seasonal_anomaly_pct: float
    extreme_multiplier: float
    trend_c_per_decade: float
    historical_range: List[MonthlyClimateEnvelope] = Field(default_factory=list)


class RiskCategoryDetail(BaseModel):
    probability_pct: int
    level: str  # LOW, MEDIUM, HIGH, EXTREME


class ExtremeRiskOutput(BaseModel):
    heavy_rain: RiskCategoryDetail
    heat: RiskCategoryDetail
    high_wind: RiskCategoryDetail
    overall_level: str
    key_drivers: List[str] = Field(default_factory=list)
    disclaimer: str = "AETHER MODEL RISK — NOT AN OFFICIAL METEOROLOGICAL WARNING"


class UncertaintyBand(BaseModel):
    spread: float
    uncertainty_range_lower: float
    uncertainty_range_upper: float


class HorizonPoint(BaseModel):
    lead_time: str  # "Now", "+6h", "+12h", "+24h", "+48h", "+72h"
    horizon_hours: int
    ECMWF: float
    AIFS: float
    GFS: float
    AETHER: float
    lower: float
    upper: float


class ShapFactor(BaseModel):
    feature: str
    attribution: float
    direction: str  # "positive", "negative"


class ModelExplanationOutput(BaseModel):
    model: str
    assigned_weight: float
    top_factors: List[ShapFactor] = Field(default_factory=list)
    shap_waterfall: List[Dict[str, Any]] = Field(default_factory=list)


class ModelHealthStatus(BaseModel):
    available: bool
    health: str  # "HEALTHY", "DEGRADED", "UNAVAILABLE"
    latency_ms: Optional[int] = None


class CanonicalForecastResponse(BaseModel):
    """
    The Single Canonical Intelligence Object for AETHER.
    Every page on the frontend consumes this object for the selected station,
    guaranteeing that 42.3 mm, 78% confidence, 46% AIFS weight, etc. are identical everywhere.
    """
    location: LocationInfo
    timestamp: datetime
    target_time: datetime
    data_mode: str = Field(..., examples=["DEMO"])
    data_source: str = Field(..., examples=["SYNTHETIC_SCENARIO"])
    data_freshness: DataFreshness = Field(default_factory=DataFreshness)
    variable: str = Field(..., examples=["rainfall_mm"])
    lead_time_hours: int = Field(..., examples=[24])
    forecasts: Dict[str, float] = Field(..., description="Raw model forecasts {ECMWF_IFS: 39.1, ECMWF_AIFS: 44.8, GFS: 42.9}")
    aether_forecast: AetherForecastOutput
    weights: Dict[str, float] = Field(..., description="Normalized softmax weights summing to 1.0")
    confidence: ConfidenceOutput
    weather_regime: WeatherRegimeOutput
    observations: ObservationVerification
    climate_context: ClimateContextOutput
    risk: ExtremeRiskOutput
    uncertainty: UncertaintyBand
    multi_horizon: List[HorizonPoint] = Field(default_factory=list)
    explanations: ModelExplanationOutput
    model_status: Dict[str, ModelHealthStatus] = Field(default_factory=dict)
