"""
Integration Tests for AETHER FastAPI Endpoints
Verifies:
/api/status
/api/forecast
/api/models
/api/models/performance
/api/weights
/api/weights/map
/api/risk
/api/climate
/api/explanation
/api/query
/api/benchmark
"""
from fastapi.testclient import TestClient
import pytest
from backend.app.main import app

client = TestClient(app)


def test_api_status():
    resp = client.get("/api/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPERATIONAL"
    assert "data_mode" in data
    assert "target_grid_resolution" in data


def test_api_forecast():
    resp = client.get("/api/forecast?lat=28.6139&lon=77.2090&var=rainfall_mm&horizon=24")
    assert resp.status_code == 200
    data = resp.json()
    assert "calibrated_forecast" in data
    assert "confidence_pct" in data
    assert "dominant_model" in data
    assert "model_weights" in data
    assert "ECMWF_IFS" in data["model_weights"]
    assert "ECMWF_AIFS" in data["model_weights"]
    assert "GFS" in data["model_weights"]


def test_api_models():
    resp = client.get("/api/models")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 3

    resp_perf = client.get("/api/models/performance")
    assert resp_perf.status_code == 200
    assert isinstance(resp_perf.json(), list)


def test_api_weights_map():
    resp = client.get("/api/weights/map?var=rainfall_mm&horizon=24")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    assert "dominant_model" in data[0]
    assert "weights" in data[0]


def test_api_risk():
    resp = client.get("/api/risk?lat=28.6139&lon=77.2090&horizon=24")
    assert resp.status_code == 200
    data = resp.json()
    assert "risks" in data
    assert "HEAVY_RAIN" in data["risks"]
    assert "HEATWAVE" in data["risks"]
    assert "HIGH_WIND" in data["risks"]
    assert "disclaimer" in data


def test_api_climate():
    resp = client.get("/api/climate?lat=28.6139&lon=77.2090&var=rainfall_mm")
    assert resp.status_code == 200
    data = resp.json()
    assert "climatological_baseline_mean" in data
    assert "anomaly_absolute" in data
    assert "percentile" in data


def test_api_explanation():
    resp = client.get("/api/explanation?model=ECMWF_AIFS&lat=28.6139&lon=77.2090&var=rainfall_mm&horizon=24")
    assert resp.status_code == 200
    data = resp.json()
    assert data["model"] == "ECMWF_AIFS"
    assert "assigned_weight" in data
    assert "top_drivers" in data


def test_api_query():
    resp = client.post("/api/query", json={"query": "Why is rainfall confidence low in Delhi?"})
    assert resp.status_code == 200
    data = resp.json()
    assert "headline" in data
    assert "blended_forecast" in data
    assert "confidence" in data


def test_api_benchmark():
    resp = client.get("/api/benchmark?var=rainfall_mm&horizon=24")
    assert resp.status_code == 200
    data = resp.json()
    assert "comparison_table" in data
    assert len(data["comparison_table"]) > 0
