"""
Synthetic Scenario Adapter — for pipeline testing / offline demonstration.

IMPORTANT DISCLAIMER:
This adapter generates physically coherent synoptic meteorological scenarios
exclusively for offline hackathon testing and end-to-end pipeline verification.
It must NEVER be represented as real historical meteorological observations.
All records produced carry:
    data_mode = "DEMO"
    data_source = "SYNTHETIC_SCENARIO"
"""
from datetime import datetime, timedelta
import math
from typing import Dict, List, Optional, Tuple
import numpy as np
from backend.app.core.config import settings
from backend.app.data.base_adapter import BaseWeatherAdapter
from backend.app.schemas.forecast_schema import ForecastRecord, ObservationRecord


class SyntheticScenarioAdapter(BaseWeatherAdapter):
    """
    Simulates synoptic Indian weather phenomena:
    1. Southwest Monsoon Depression (Heavy rain, strong maritime winds, high humidity)
    2. Western Disturbance (Himalayan rain/snow, northern cold wave, pressure trough)
    3. Pre-Monsoon Heatwave (Northwest/Central India, extreme temperatures, dry air)
    4. Tropical Cyclone (Bay of Bengal / Arabian Sea intense wind & rain bands)
    5. Normal Seasonal Climatology (Equilibrium diurnal cycles)
    """

    def __init__(self, seed: int = 42):
        self.mode = "DEMO"
        self.source_name = "SYNTHETIC_SCENARIO"
        self.rng = np.random.RandomState(seed)

    def get_mode(self) -> str:
        return self.mode

    def get_source_name(self) -> str:
        return self.source_name

    def _determine_regime(self, dt: datetime, lat: float, lon: float) -> str:
        """Determines predominant synoptic regime from calendar date and geography."""
        month = dt.month
        day = dt.day

        # Monsoon season (June to September)
        if 6 <= month <= 9:
            # Random convective active phase vs normal monsoon break
            if (day % 7) in (1, 2, 3) and lat < 28.0:
                return "HEAVY_RAIN"
            return "NORMAL"

        # Pre-monsoon Heatwave (April to May) in Northwest/Central
        elif 4 <= month <= 5 and 18.0 <= lat <= 32.0 and lon < 82.0:
            if day > 10:
                return "HEAT"
            return "DRY"

        # Winter Western Disturbance (December to February) in North
        elif (month in (12, 1, 2)) and lat >= 27.0:
            if day % 6 == 0:
                return "HIGH_WIND"
            return "NORMAL"

        # Post-monsoon Cyclone risk (October to November) in Coastal
        elif (month in (10, 11)) and (lon > 82.0 or lon < 74.0) and lat < 22.0:
            if (day % 14) in (3, 4, 5):
                return "EXTREME"
            return "NORMAL"

        return "NORMAL"

    def _generate_synthetic_weather_state(
        self, dt: datetime, lat: float, lon: float, regime: str
    ) -> Dict[str, float]:
        """Generates realistic underlying atmospheric ground truth (observation)."""
        day_of_year = dt.timetuple().tm_yday
        hour = dt.hour

        # Base diurnal temperature curve: annual wave + daily wave
        annual_temp_mean = 27.0 - 0.4 * (lat - 15.0)
        annual_temp_amplitude = 8.0 if lat > 22.0 else 3.5
        diurnal_temp = -math.cos(2 * math.pi * (day_of_year - 140) / 365.0) * annual_temp_amplitude
        daily_temp_cycle = math.sin(2 * math.pi * (hour - 9) / 24.0) * 5.0
        temp = annual_temp_mean + diurnal_temp + daily_temp_cycle

        # Base wind speed
        wind_base = 3.5 + 1.5 * math.sin(2 * math.pi * day_of_year / 365.0)
        wind = wind_base

        # Base pressure
        pressure = 1013.25 - 2.5 * math.sin(2 * math.pi * (day_of_year - 180) / 365.0)

        # Base rainfall
        rain = 0.0

        # Apply Synoptic Regime Modulation
        if regime == "HEAVY_RAIN":
            rain = self.rng.gamma(shape=3.0, scale=25.0)  # Heavy rainfall e.g. 50-120 mm
            temp -= 3.0
            wind += self.rng.uniform(6.0, 14.0)
            pressure -= 8.0
            humidity = self.rng.uniform(85.0, 98.0)
        elif regime == "HEAT":
            temp += self.rng.uniform(4.5, 7.5)  # Severe heatwave 41 - 47°C
            rain = 0.0
            wind = self.rng.uniform(3.0, 8.0)
            pressure -= 3.0
            humidity = self.rng.uniform(18.0, 35.0)
        elif regime == "HIGH_WIND":
            wind += self.rng.uniform(12.0, 20.0)  # Strong wind / gale 15 - 24 m/s
            rain = self.rng.exponential(scale=10.0)
            humidity = self.rng.uniform(60.0, 80.0)
        elif regime == "EXTREME":
            # Cyclone-like severe weather
            rain = self.rng.gamma(shape=4.0, scale=35.0)  # 100+ mm
            wind = self.rng.uniform(22.0, 34.0)  # Severe gale
            pressure -= 24.0  # Intense depression
            humidity = 95.0
        elif regime == "DRY":
            temp += 2.0
            rain = 0.0
            humidity = self.rng.uniform(20.0, 40.0)
        else:  # NORMAL
            rain = self.rng.exponential(scale=1.5) if (6 <= dt.month <= 9) else 0.0
            humidity = self.rng.uniform(50.0, 75.0)

        return {
            "rainfall_mm": round(max(0.0, rain), 1),
            "temperature_c": round(temp, 1),
            "wind_speed_ms": round(max(0.5, wind), 1),
            "pressure_hpa": round(pressure, 1),
            "humidity_pct": round(min(100.0, max(10.0, humidity)), 1),
            "regime": regime
        }

    def _generate_model_forecasts(
        self, actual: Dict[str, float], lead_time: int, regime: str
    ) -> Dict[str, Dict[str, float]]:
        """
        Generates realistic forecast outputs for ECMWF_IFS, ECMWF_AIFS, and GFS
        conforming to known meteorological model characteristics:
        - Lead time degradation factor sqrt(lead_time / 24.0)
        - ECMWF: Physics-based, slightly underpredicts heavy convective rainfall extremes
        - AIFS: AI-based, captures nonlinear heavy rain regimes better, slightly smoother wind
        - GFS: Independent NWP, good mid-latitude skill, slight displacement bias on monsoon lows
        """
        decay = math.sqrt(max(1.0, lead_time / 24.0))

        # ECMWF Forecast
        ecmwf_rain = (
            actual["rainfall_mm"] * (0.88 if regime in ("HEAVY_RAIN", "EXTREME") else 1.02)
            + self.rng.normal(0.0, 3.5 * decay)
        )
        ecmwf_temp = actual["temperature_c"] + self.rng.normal(-0.2, 0.6 * decay)
        ecmwf_wind = actual["wind_speed_ms"] + self.rng.normal(0.0, 1.0 * decay)

        # AIFS Forecast
        aifs_rain = (
            actual["rainfall_mm"] * (1.01 if regime in ("HEAVY_RAIN", "EXTREME") else 0.96)
            + self.rng.normal(0.0, 2.8 * decay)
        )
        aifs_temp = actual["temperature_c"] + self.rng.normal(0.1, 0.5 * decay)
        aifs_wind = actual["wind_speed_ms"] * 0.94 + self.rng.normal(0.0, 1.2 * decay)

        # GFS Forecast
        gfs_rain = (
            actual["rainfall_mm"] * (1.12 if regime in ("HEAVY_RAIN", "EXTREME") else 0.92)
            + self.rng.normal(0.0, 4.8 * decay)
        )
        gfs_temp = actual["temperature_c"] + self.rng.normal(0.5, 0.8 * decay)
        gfs_wind = actual["wind_speed_ms"] * 1.06 + self.rng.normal(0.2, 1.4 * decay)

        return {
            "ECMWF_IFS": {
                "rainfall_mm": round(max(0.0, ecmwf_rain), 1),
                "temperature_c": round(ecmwf_temp, 1),
                "wind_speed_ms": round(max(0.5, ecmwf_wind), 1),
            },
            "ECMWF_AIFS": {
                "rainfall_mm": round(max(0.0, aifs_rain), 1),
                "temperature_c": round(aifs_temp, 1),
                "wind_speed_ms": round(max(0.5, aifs_wind), 1),
            },
            "GFS": {
                "rainfall_mm": round(max(0.0, gfs_rain), 1),
                "temperature_c": round(gfs_temp, 1),
                "wind_speed_ms": round(max(0.5, gfs_wind), 1),
            }
        }

    def fetch_observations(
        self,
        variables: List[str],
        start_time: datetime,
        end_time: datetime,
        bbox: Optional[Dict[str, float]] = None,
        locations: Optional[List[Dict[str, float]]] = None
    ) -> List[ObservationRecord]:
        """Generates ground truth observation records across locations and time steps."""
        locs = locations or settings.REFERENCE_LOCATIONS
        records: List[ObservationRecord] = []

        cur_dt = start_time
        while cur_dt <= end_time:
            for loc in locs:
                regime = self._determine_regime(cur_dt, loc["lat"], loc["lon"])
                state = self._generate_synthetic_weather_state(cur_dt, loc["lat"], loc["lon"], regime)
                for var in variables:
                    if var in state:
                        records.append(
                            ObservationRecord(
                                timestamp=cur_dt,
                                latitude=loc["lat"],
                                longitude=loc["lon"],
                                variable=var,
                                actual_value=state[var],
                                source="SYNTHETIC_SCENARIO",
                                data_mode="DEMO"
                            )
                        )
            cur_dt += timedelta(hours=6)

        return records

    def fetch_forecasts(
        self,
        variables: List[str],
        horizons: List[int],
        start_time: datetime,
        end_time: datetime,
        bbox: Optional[Dict[str, float]] = None,
        locations: Optional[List[Dict[str, float]]] = None
    ) -> List[ForecastRecord]:
        """Generates multi-model forecast records for ECMWF_IFS, ECMWF_AIFS, and GFS."""
        locs = locations or settings.REFERENCE_LOCATIONS
        records: List[ForecastRecord] = []

        cur_dt = start_time
        while cur_dt <= end_time:
            for loc in locs:
                regime = self._determine_regime(cur_dt, loc["lat"], loc["lon"])
                actual_state = self._generate_synthetic_weather_state(cur_dt, loc["lat"], loc["lon"], regime)

                for horizon in horizons:
                    model_forecasts = self._generate_model_forecasts(actual_state, horizon, regime)
                    for model_name, preds in model_forecasts.items():
                        for var in variables:
                            if var in preds:
                                records.append(
                                    ForecastRecord(
                                        timestamp=cur_dt,
                                        latitude=loc["lat"],
                                        longitude=loc["lon"],
                                        model=model_name,
                                        variable=var,
                                        lead_time_hours=horizon,
                                        value=preds[var],
                                        pressure_hpa=actual_state["pressure_hpa"],
                                        humidity_pct=actual_state["humidity_pct"],
                                        data_mode="DEMO",
                                        data_source="SYNTHETIC_SCENARIO"
                                    )
                                )
            cur_dt += timedelta(hours=6)

        return records
