"""
AETHER Backtesting & Benchmark Matrix API Router
"""
from fastapi import APIRouter, Query
from backend.app.schemas.benchmark_schema import BenchmarkMatrixResponse
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
