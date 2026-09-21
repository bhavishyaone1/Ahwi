"""
AETHER Dynamic Weights & Geographic Weight Map API Router
"""
from typing import Any, Dict, List
from fastapi import APIRouter, Query
from backend.app.schemas.forecast_schema import ModelWeightOutput
from backend.app.services.aether_service import aether_service

router = APIRouter(prefix="/weights", tags=["Weights"])


@router.get("", response_model=ModelWeightOutput)
def get_point_weights(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    var: str = Query("rainfall_mm", description="Variable"),
    horizon: int = Query(24, description="Horizon (6, 12, 24, 48, 72)")
):
    """Returns dynamic model weights calculated for a specific coordinate."""
    res = aether_service.get_forecast_for_location(lat, lon, var, horizon)
    return ModelWeightOutput(
        timestamp=res.target_time,
        latitude=lat,
        longitude=lon,
        variable=var,
        lead_time_hours=horizon,
        weights=res.model_weights,
        detected_regime=res.detected_regime,
        regime_confidence=res.regime_probabilities.get(res.detected_regime, 0.75),
        data_mode=res.data_mode,
        data_source=res.data_source
    )


@router.get("/map")
def get_geographic_weight_map(
    var: str = Query("rainfall_mm", description="Variable"),
    horizon: int = Query(24, description="Horizon")
) -> List[Dict[str, Any]]:
    """
    Returns spatial model contribution map across Indian meteorological stations/grid.
    Directly satisfies SIH PS 26081 requirement for model weight maps.
    """
    return aether_service.get_geographic_weight_grid(variable=var, lead_time_hours=horizon)
