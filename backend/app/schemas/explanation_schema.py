"""
AETHER Explainability & SHAP Schemas
"""
from typing import List
from pydantic import BaseModel, Field


class ShapFeatureContribution(BaseModel):
    feature_name: str
    feature_value: float
    shap_value: float = Field(..., description="SHAP attribution value for model weight")
    effect: str = Field(..., description="'INCREASES_WEIGHT' or 'DECREASES_WEIGHT'")
    plain_text_explanation: str


class ModelExplanationResponse(BaseModel):
    location_name: str
    model: str
    assigned_weight: float
    base_value: float
    top_drivers: List[ShapFeatureContribution]
    summary_narrative: str
    data_mode: str = "REAL"
