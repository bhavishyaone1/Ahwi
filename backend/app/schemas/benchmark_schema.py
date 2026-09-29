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
    csi: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Critical Success Index for extreme precipitation events")
    corr: Optional[float] = Field(default=None, ge=-1.0, le=1.0, description="Pearson correlation coefficient with ground truth observations")
    skill_score: Optional[float] = Field(default=None, description="Skill score relative to persistence or climatology")
    sample_count: int


class BenchmarkMatrixResponse(BaseModel):
    variable: str = Field(..., description="rainfall_mm, temperature_c, wind_speed_ms")
    lead_time_hours: int = Field(..., description="6, 12, 24, 48, 72")
    weather_regime: str = Field(..., description="NORMAL, HEAVY_RAIN, HEAT, HIGH_WIND, ALL")
    test_period: str = Field(default="2024-01-01 to 2025-12-31 (Chronological Out-of-Sample)")
    comparison_table: List[BenchmarkModelMetric]
    data_mode: str = "REAL"


class LeadTimeSkillPoint(BaseModel):
    horizon: str = Field(..., description="e.g. 6h, 12h, 24h, 48h, 72h")
    horizon_hours: int
    Persistence: float
    Equal_Weight: float
    IFS: float
    AIFS: float
    GFS: float
    AETHER: float


class LeadTimeSkillCurveResponse(BaseModel):
    variable: str
    weather_regime: str
    metric: str = "MAE"
    unit: str = "mm"
    points: List[LeadTimeSkillPoint]
    data_mode: str = "REAL"
