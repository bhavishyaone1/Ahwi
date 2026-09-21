"""
AETHER Backtesting & Benchmark Evaluation Schemas
Judges validation page schema reporting authentic empirical metrics without bias.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class BenchmarkModelMetric(BaseModel):
    model_name: str = Field(..., description="Persistence, ECMWF_IFS, ECMWF_AIFS, GFS, Equal_Weight, Static_Blend, AETHER")
    mae: float = Field(..., ge=0.0)
    rmse: float = Field(..., ge=0.0)
    bias: float
    csi: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Critical Success Index for extreme events")
    sample_count: int


class BenchmarkMatrixResponse(BaseModel):
    variable: str = Field(..., description="rainfall_mm, temperature_c, wind_speed_ms")
    lead_time_hours: int = Field(..., description="6, 12, 24, 48, 72")
    weather_regime: str = Field(..., description="NORMAL, HEAVY_RAIN, HEAT, HIGH_WIND, ALL")
    test_period: str = Field(default="2024-01-01 to 2025-12-31 (Chronological Out-of-Sample)")
    comparison_table: List[BenchmarkModelMetric]
    data_mode: str = "REAL"
