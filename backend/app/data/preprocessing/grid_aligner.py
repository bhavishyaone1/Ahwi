"""
AETHER Spatial & Temporal Harmonization Layer
Aligns heterogeneous forecast grids and timestamps onto AETHER's standardized 0.25° grid.
"""
from datetime import datetime
import math
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from backend.app.core.config import settings
from backend.app.schemas.forecast_schema import ForecastRecord, ObservationRecord


class GridAligner:
    """Harmonizes spatial coordinates to target grid resolution and matches valid forecast times."""

    def __init__(self, target_res: float = settings.TARGET_GRID_RESOLUTION):
        self.target_res = target_res

    def snap_to_target_grid(self, lat: float, lon: float) -> Tuple[float, float]:
        """Snaps latitude and longitude to nearest 0.25° cell center."""
        snapped_lat = round(round(lat / self.target_res) * self.target_res, 2)
        snapped_lon = round(round(lon / self.target_res) * self.target_res, 2)
        return snapped_lat, snapped_lon

    def align_forecasts_and_observations(
        self,
        forecasts: List[ForecastRecord],
        observations: List[ObservationRecord]
    ) -> pd.DataFrame:
        """
        Merges forecasts and ground-truth observations matching on:
        (snapped_lat, snapped_lon, timestamp, variable).
        Returns a clean pandas DataFrame ready for feature engineering and error tracking.
        """
        if not forecasts or not observations:
            return pd.DataFrame()

        # Convert forecasts to DataFrame
        f_rows = []
        for f in forecasts:
            slat, slon = self.snap_to_target_grid(f.latitude, f.longitude)
            f_rows.append({
                "timestamp": f.timestamp,
                "lat": slat,
                "lon": slon,
                "model": f.model,
                "variable": f.variable,
                "lead_time": f.lead_time_hours,
                "forecast_value": f.value,
                "pressure_hpa": f.pressure_hpa,
                "humidity_pct": f.humidity_pct,
                "data_mode": f.data_mode
            })
        df_forecasts = pd.DataFrame(f_rows)

        # Convert observations to DataFrame
        o_rows = []
        for o in observations:
            slat, slon = self.snap_to_target_grid(o.latitude, o.longitude)
            o_rows.append({
                "timestamp": o.timestamp,
                "lat": slat,
                "lon": slon,
                "variable": o.variable,
                "actual_value": o.actual_value,
                "obs_source": o.source
            })
        df_obs = pd.DataFrame(o_rows)

        # Merge on time, location, variable
        merged = pd.merge(
            df_forecasts,
            df_obs,
            on=["timestamp", "lat", "lon", "variable"],
            how="inner"
        )

        # Compute immediate forecast error (forecast - actual)
        merged["error"] = merged["forecast_value"] - merged["actual_value"]
        merged["abs_error"] = merged["error"].abs()
        merged["sq_error"] = merged["error"] ** 2

        return merged
