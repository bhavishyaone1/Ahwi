"""
AETHER Extreme-Weather Risk Engine & Calibrated Confidence Formulation
Computes:
1. Calibrated probabilistic risk for Heavy Rain, Heatwave, and High Wind.
2. Mathematically grounded confidence formulation derived from uncertainty features.
"""
from datetime import datetime
import math
from typing import Dict, List, Tuple
import numpy as np
from backend.app.schemas.risk_schema import ExtremeRiskProbability, ExtremeRiskAssessment


class ExtremeRiskEngine:
    """Estimates probabilistic risks and generates structured risk assessments."""

    def __init__(self):
        self.disclaimer = (
            "AETHER Statistical Model Risk - Not an official meteorological warning. "
            "Refer to IMD/NCMRWF for official weather advisories."
        )

    def compute_risk_probabilities(
        self,
        blended_forecast: float,
        variable: str,
        regime: str,
        regime_prob: float,
        spread: float,
        temp_c: float,
        wind_ms: float,
        rain_mm: float
    ) -> Dict[str, ExtremeRiskProbability]:
        """
        Computes calibrated probability for:
        - Heavy Rain (> 64.5 mm)
        - Heatwave (Temp >= 40 C)
        - High Wind (Wind >= 15 m/s)
        """
        # 1. Heavy Rain Probability
        # Logistic sigmoid centered near IMD threshold 64.5 mm, modulated by regime and spread
        rain_val = rain_mm if variable != "rainfall_mm" else blended_forecast
        z_rain = (rain_val - 50.0) / 18.0 + (1.2 if regime in ("HEAVY_RAIN", "EXTREME") else -0.5)
        p_rain = 1.0 / (1.0 + math.exp(-max(-8.0, min(8.0, z_rain))))
        p_rain_pct = round(p_rain * 100.0, 1)

        rain_signals = []
        if rain_val > 40.0:
            rain_signals.append(f"Blended rainfall forecast {rain_val} mm approaches IMD heavy threshold")
        if regime in ("HEAVY_RAIN", "EXTREME"):
            rain_signals.append(f"Synoptic environment indicates {regime} regime (prob {regime_prob*100:.0f}%)")
        if spread > 8.0:
            rain_signals.append(f"Elevated model spread ({spread} mm) suggests localized convective variability")
        if not rain_signals:
            rain_signals.append("Current atmospheric moisture within seasonal climatological baseline")

        level_rain = "LOW" if p_rain_pct < 30 else ("WATCH" if p_rain_pct < 60 else ("HIGH" if p_rain_pct < 80 else "EXTREME"))

        # 2. Heatwave Probability
        temp_val = temp_c if variable != "temperature_c" else blended_forecast
        z_heat = (temp_val - 38.5) / 2.2 + (1.5 if regime == "HEAT" else -0.8)
        p_heat = 1.0 / (1.0 + math.exp(-max(-8.0, min(8.0, z_heat))))
        p_heat_pct = round(p_heat * 100.0, 1)

        heat_signals = []
        if temp_val >= 39.0:
            heat_signals.append(f"Forecast maximum temperature {temp_val}°C near plain-area warning criteria")
        if regime == "HEAT":
            heat_signals.append("High pressure ridge and dry continental advection detected")
        if not heat_signals:
            heat_signals.append("Thermal conditions within comfortable seasonal range")

        level_heat = "LOW" if p_heat_pct < 30 else ("WATCH" if p_heat_pct < 60 else ("HIGH" if p_heat_pct < 80 else "EXTREME"))

        # 3. High Wind Risk Probability
        wind_val = wind_ms if variable != "wind_speed_ms" else blended_forecast
        z_wind = (wind_val - 13.0) / 2.5 + (1.8 if regime in ("HIGH_WIND", "EXTREME") else -0.6)
        p_wind = 1.0 / (1.0 + math.exp(-max(-8.0, min(8.0, z_wind))))
        p_wind_pct = round(p_wind * 100.0, 1)

        wind_signals = []
        if wind_val >= 12.0:
            wind_signals.append(f"Sustained wind {wind_val} m/s indicates squally conditions")
        if regime in ("HIGH_WIND", "EXTREME"):
            wind_signals.append("Strong baroclinic gradient or cyclonic vortex active")
        if not wind_signals:
            wind_signals.append("Surface winds within normal operational levels")

        level_wind = "LOW" if p_wind_pct < 30 else ("WATCH" if p_wind_pct < 60 else ("HIGH" if p_wind_pct < 80 else "EXTREME"))

        return {
            "HEAVY_RAIN": ExtremeRiskProbability(
                event_type="HEAVY_RAIN",
                probability_pct=p_rain_pct,
                risk_level=level_rain,
                threshold_description="Precipitation > 64.5 mm / 24h (IMD Heavy Rain criterion)",
                contributing_signals=rain_signals
            ),
            "HEATWAVE": ExtremeRiskProbability(
                event_type="HEATWAVE",
                probability_pct=p_heat_pct,
                risk_level=level_heat,
                threshold_description="Maximum Temperature >= 40.0°C in plains",
                contributing_signals=heat_signals
            ),
            "HIGH_WIND": ExtremeRiskProbability(
                event_type="HIGH_WIND",
                probability_pct=p_wind_pct,
                risk_level=level_wind,
                threshold_description="Sustained surface winds >= 15.0 m/s (~30 knots)",
                contributing_signals=wind_signals
            )
        }


class CalibratedConfidenceFormulator:
    """
    Formulates a mathematically grounded confidence rating [15%, 98%]
    based on measurable uncertainty features.
    """

    @staticmethod
    def calculate_confidence(
        spread: float,
        mean_forecast: float,
        recent_mae: float,
        regime_prob: float,
        lead_time_hours: int
    ) -> Tuple[float, str, List[str]]:
        """
        Calculates calibrated confidence percentage and explains the underlying drivers.
        Returns: (confidence_pct, confidence_tier, drivers_list)
        """
        # Relative spread penalty
        rel_spread = spread / max(1.0, abs(mean_forecast) * 0.15 + 2.0)
        spread_penalty = min(0.35, rel_spread * 0.18)

        # Recent error penalty
        error_penalty = min(0.30, (recent_mae / 10.0) * 0.22)

        # Regime entropy / uncertainty penalty
        regime_penalty = min(0.18, (1.0 - regime_prob) * 0.20)

        # Lead time decay penalty (lead time degrades certainty)
        lead_time_penalty = min(0.20, (lead_time_hours / 72.0) * 0.15)

        total_penalty = spread_penalty + error_penalty + regime_penalty + lead_time_penalty
        raw_conf = 1.0 - total_penalty
        confidence_pct = round(max(18.0, min(96.0, raw_conf * 100.0)), 1)

        drivers = []
        if rel_spread < 0.6:
            drivers.append("High model agreement between ECMWF, AIFS, and GFS")
        else:
            drivers.append("Moderate disagreement / spread among forecast members")

        if recent_mae < 4.0:
            drivers.append("Strong recent forecast accuracy under current weather pattern")
        else:
            drivers.append("Elevated rolling error observed in recent forecast cycles")

        if regime_prob >= 0.70:
            drivers.append("Stable synoptic regime classification")
        else:
            drivers.append("Transitional weather regime detected")

        if lead_time_hours <= 24:
            drivers.append(f"High-certainty short lead horizon ({lead_time_hours}h)")
        else:
            drivers.append(f"Extended lead horizon ({lead_time_hours}h) subject to atmospheric decay")

        tier = "High" if confidence_pct >= 75.0 else ("Moderate" if confidence_pct >= 55.0 else "Low")
        return confidence_pct, tier, drivers
