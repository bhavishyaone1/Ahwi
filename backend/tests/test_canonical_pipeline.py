"""
Test Canonical Intelligence Pipeline & Single Source of Truth
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_canonical_endpoint_delhi_reference():
    """Verifies that the canonical endpoint returns the exact canonical reference numbers."""
    response = client.get("/api/canonical?lat=28.6139&lon=77.2090&var=rainfall_mm&horizon=24&location_name=Delhi%20NCR")
    assert response.status_code == 200
    data = response.json()

    # Location
    assert data["location"]["name"] == "Delhi NCR"
    assert data["variable"] == "rainfall_mm"
    assert data["lead_time_hours"] == 24

    # Raw Forecasts
    assert data["forecasts"]["ECMWF_IFS"] == 39.1
    assert data["forecasts"]["ECMWF_AIFS"] == 44.8
    assert data["forecasts"]["GFS"] == 42.9

    # Dynamic Softmax Weights summing to 1.0
    weights = data["weights"]
    assert weights["ECMWF_AIFS"] == 0.46
    assert weights["ECMWF_IFS"] == 0.32
    assert weights["GFS"] == 0.22
    assert pytest.approx(sum(weights.values()), 0.001) == 1.0

    # AETHER Calibrated Forecast
    assert data["aether_forecast"]["calibrated_value"] == 42.3
    assert data["aether_forecast"]["bias_applied"] == -0.3

    # Confidence & Regime
    assert data["confidence"]["pct"] == 78
    assert data["weather_regime"]["detected"] == "HEAVY_RAIN"

    # Climate Context
    assert data["climate_context"]["climate_normal"] == 21.4
    assert data["climate_context"]["anomaly"] == 20.9
    assert data["climate_context"]["percentile"] == 92

    # Extreme Risk
    assert data["risk"]["heavy_rain"]["probability_pct"] == 78
    assert data["risk"]["heat"]["probability_pct"] == 14
    assert data["risk"]["high_wind"]["probability_pct"] == 31
    assert "NOT AN OFFICIAL METEOROLOGICAL WARNING" in data["risk"]["disclaimer"]

    # Observations
    assert data["observations"]["recent_observation_value"] == 38.4
    assert data["observations"]["satellite_agreement"] == "HIGH"

    # Multi-Horizon
    assert len(data["multi_horizon"]) == 6
    assert data["multi_horizon"][3]["AETHER"] == 42.3


def test_forecast_trace_endpoint():
    """Verifies that the forecast trace drawer endpoint returns all 12 pipeline steps."""
    response = client.get("/api/trace")
    assert response.status_code == 200
    data = response.json()
    assert "steps" in data
    assert len(data["steps"]) == 12
    step_names = [s["name"] for s in data["steps"]]
    assert "Forecast Sources" in step_names
    assert "Weather Regime Detection" in step_names
    assert "Causal LSTM Sequence" in step_names
    assert "Adaptive Trust Engine" in step_names
    assert "AETHER Hybrid Blend" in step_names
    assert "SHAP Explainability" in step_names
