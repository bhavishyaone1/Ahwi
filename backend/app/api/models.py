"""
AETHER Models & Historical Performance API Router
"""
from typing import Dict, List
from fastapi import APIRouter
from backend.app.schemas.forecast_schema import ModelPerformanceRecord
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("")
def list_operational_models() -> List[Dict[str, str]]:
    """Returns metadata for connected NWP and AI forecast sources."""
    return [
        {
            "id": "ECMWF_IFS",
            "name": "ECMWF Integrated Forecasting System (IFS)",
            "type": "Physics-Based Numerical Weather Prediction (NWP)",
            "native_resolution": "~9 km (0.1°)",
            "update_cycle": "6-hourly",
            "role": "Physics backbone for synoptic pressure, wind, and broad precipitation"
        },
        {
            "id": "ECMWF_AIFS",
            "name": "ECMWF Artificial Intelligence Forecasting System (AIFS)",
            "type": "Data-Driven Deep Learning Weather Foundation Model",
            "native_resolution": "0.25°",
            "update_cycle": "6-hourly",
            "role": "High-speed non-linear convective representation & pattern recognition"
        },
        {
            "id": "GFS",
            "name": "NOAA NCEP Global Forecast System (GFS)",
            "type": "Physics-Based Numerical Weather Prediction (NWP)",
            "native_resolution": "0.25°",
            "update_cycle": "6-hourly",
            "role": "Independent global physics benchmark"
        },
        {
            "id": "NCUM",
            "name": "NCMRWF Unified Model (NCUM / NEPS)",
            "type": "Operational Indian NWP System (MoES)",
            "native_resolution": "12 km regional / 4 km convective",
            "update_cycle": "Operational",
            "role": "Extensible connector for official MoES/NCMRWF data stream"
        }
    ]


@router.get("/performance", response_model=List[ModelPerformanceRecord])
def get_model_performance():
    """Returns historical skill metrics (MAE, RMSE, Bias, Skill) for each model."""
    return aether_service.error_engine.calculate_model_metrics(
        aether_service.df_aligned_history
    )
