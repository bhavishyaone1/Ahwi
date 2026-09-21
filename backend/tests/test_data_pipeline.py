"""
Unit Tests for AETHER Data Pipeline & Error Memory
"""
from datetime import datetime, timedelta
import numpy as np
import pytest
from backend.app.data.preprocessing.grid_aligner import GridAligner
from backend.app.data.scenarios.synthetic_adapter import SyntheticScenarioAdapter
from backend.app.ml.baselines.error_engine import HistoricalErrorEngine


def test_synthetic_scenario_adapter_schema():
    adapter = SyntheticScenarioAdapter(seed=42)
    assert adapter.get_mode() == "DEMO"
    assert adapter.get_source_name() == "SYNTHETIC_SCENARIO"

    now = datetime.utcnow()
    forecasts = adapter.fetch_forecasts(
        variables=["rainfall_mm", "temperature_c"],
        horizons=[24],
        start_time=now,
        end_time=now + timedelta(hours=6)
    )
    assert len(forecasts) > 0
    f0 = forecasts[0]
    assert f0.data_mode == "DEMO"
    assert f0.data_source == "SYNTHETIC_SCENARIO"
    assert f0.model in ("ECMWF_IFS", "ECMWF_AIFS", "GFS")
    assert f0.lead_time_hours == 24


def test_grid_aligner_and_error_calculation():
    adapter = SyntheticScenarioAdapter(seed=42)
    aligner = GridAligner(target_res=0.25)
    now = datetime.utcnow()

    forecasts = adapter.fetch_forecasts(
        variables=["rainfall_mm"],
        horizons=[24],
        start_time=now,
        end_time=now + timedelta(hours=6)
    )
    obs = adapter.fetch_observations(
        variables=["rainfall_mm"],
        start_time=now,
        end_time=now + timedelta(hours=6)
    )

    df_aligned = aligner.align_forecasts_and_observations(forecasts, obs)
    assert not df_aligned.empty
    assert "error" in df_aligned.columns
    assert "abs_error" in df_aligned.columns

    # Test error engine
    error_engine = HistoricalErrorEngine()
    metrics = error_engine.calculate_model_metrics(df_aligned)
    assert len(metrics) > 0
    for m in metrics:
        assert m.mae >= 0.0
        assert m.rmse >= 0.0
        assert m.model in ("ECMWF_IFS", "ECMWF_AIFS", "GFS")
