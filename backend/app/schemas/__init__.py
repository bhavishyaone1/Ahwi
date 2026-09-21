"""AETHER Schemas Package"""
from backend.app.schemas.forecast_schema import (
    ForecastRecord,
    ObservationRecord,
    ModelPerformanceRecord,
    ModelWeightOutput,
    BlendedForecastResponse,
)
from backend.app.schemas.risk_schema import (
    ExtremeRiskProbability,
    ExtremeRiskAssessment,
)
from backend.app.schemas.climate_schema import (
    ClimatologicalBaselinePoint,
    ClimateContextResponse,
)
from backend.app.schemas.explanation_schema import (
    ShapFeatureContribution,
    ModelExplanationResponse,
)
from backend.app.schemas.benchmark_schema import (
    BenchmarkModelMetric,
    BenchmarkMatrixResponse,
)

__all__ = [
    "ForecastRecord",
    "ObservationRecord",
    "ModelPerformanceRecord",
    "ModelWeightOutput",
    "BlendedForecastResponse",
    "ExtremeRiskProbability",
    "ExtremeRiskAssessment",
    "ClimatologicalBaselinePoint",
    "ClimateContextResponse",
    "ShapFeatureContribution",
    "ModelExplanationResponse",
    "BenchmarkModelMetric",
    "BenchmarkMatrixResponse",
]
