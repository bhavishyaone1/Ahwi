"""
AETHER Extreme Weather Risk Schemas
Strictly demarcated as statistical model risk guidance, distinct from official IMD warnings.
"""
from datetime import datetime
from typing import Dict, List
from pydantic import BaseModel, Field


class ExtremeRiskProbability(BaseModel):
    event_type: str = Field(..., description="'HEAVY_RAIN', 'HEATWAVE', 'HIGH_WIND'")
    probability_pct: float = Field(..., ge=0.0, le=100.0)
    risk_level: str = Field(..., description="'LOW', 'WATCH', 'HIGH', 'EXTREME'")
    threshold_description: str
    contributing_signals: List[str]


class ExtremeRiskAssessment(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    valid_time: datetime
    lead_time_hours: int
    risks: Dict[str, ExtremeRiskProbability]
    overall_risk_level: str
    disclaimer: str = Field(
        default="AETHER Statistical Model Risk - Not an official meteorological warning. Consult IMD/NCMRWF for official advisories.",
        description="Mandatory disclaimer distinguishing AI risk from official warnings."
    )
    data_mode: str = "REAL"
    data_source: str = "AETHER_RISK_CLASSIFIER"
