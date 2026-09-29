"""
AETHER Backtesting & Benchmark Matrix API Router
"""
from fastapi import APIRouter, Query
from backend.app.schemas.benchmark_schema import BenchmarkMatrixResponse, LeadTimeSkillCurveResponse
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])


@router.get("", response_model=BenchmarkMatrixResponse)
def get_benchmark_results(
    var: str = Query("rainfall_mm", description="Variable: rainfall_mm, temperature_c, wind_speed_ms"),
    horizon: int = Query(24, description="Horizon (6, 12, 24, 48, 72)"),
    regime: str = Query("ALL", description="Weather regime filter (NORMAL, HEAVY_RAIN, HEAT, HIGH_WIND, ALL)")
):
    """
    Returns authentic out-of-sample backtesting metrics comparing:
    Persistence, ECMWF_IFS, ECMWF_AIFS, GFS, Equal_Weight, Static_Blend, and AETHER.
    """
    return aether_service.get_benchmark_comparison(
        variable=var,
        lead_time_hours=horizon,
        weather_regime=regime
    )


@router.get("/skill-curve", response_model=LeadTimeSkillCurveResponse)
def get_skill_curve(
    var: str = Query("rainfall_mm", description="Variable: rainfall_mm, temperature_c, wind_speed_ms"),
    regime: str = Query("ALL", description="Weather regime filter (NORMAL, HEAVY_RAIN, HEAT, HIGH_WIND, ALL)")
):
    """
    Returns MAE at each lead-time horizon (6h, 12h, 24h, 48h, 72h) for all models.
    Used to render the Lead-Time Skill Curve chart on the Benchmark page.
    """
    return aether_service.get_lead_time_skill_curve(
        variable=var,
        weather_regime=regime
    )
