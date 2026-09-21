"""
Unit Tests for AETHER Machine Learning & Blending Pipeline
Validates dynamic weighting, softmax properties, causal sequence invariants, and risk logic.
"""
import numpy as np
import pandas as pd
import pytest
import torch
from backend.app.ml.calibration.bias_corrector import BiasCorrector
from backend.app.ml.extreme.risk_engine import CalibratedConfidenceFormulator, ExtremeRiskEngine
from backend.app.ml.lstm.model import CausalWeatherLSTM, LSTMTemporalExtractor
from backend.app.ml.regime.classifier import WeatherRegimeClassifier
from backend.app.ml.weighting.adaptive_xgboost import AdaptiveWeightingEngine


def test_weather_regime_classifier():
    clf = WeatherRegimeClassifier()
    df = pd.DataFrame([{
        "temperature_c": 43.5,
        "rainfall_mm": 0.0,
        "wind_speed_ms": 5.0,
        "pressure_hpa": 1008.0,
        "humidity_pct": 20.0,
        "spread": 2.0,
        "lat": 28.6,
        "lon": 77.2,
        "month": 5,
        "day_of_year": 140
    }])
    probs = clf.predict_regime_probabilities(df)[0]
    assert "HEAT" in probs
    assert probs["HEAT"] > probs["NORMAL"]
    assert np.isclose(sum(probs.values()), 1.0, atol=0.02)


def test_causal_lstm_temporal_extractor():
    model = CausalWeatherLSTM(input_dim=8, hidden_dim=32, num_layers=2, output_dim=8)
    dummy_input = torch.randn(2, 12, 8)  # 2 samples, 12 timesteps (72h), 8 features
    output = model(dummy_input)
    assert output.shape == (2, 8)

    extractor = LSTMTemporalExtractor()
    seq = np.random.randn(12, 8)
    feat = extractor.extract_temporal_features(seq)
    assert feat.shape == (8,)


def test_adaptive_weighting_engine_dynamic_and_normalized():
    engine = AdaptiveWeightingEngine()
    # Test case 1: High rain condition
    df_rain = pd.DataFrame([{
        "spread": 6.5,
        "rainfall_mm": 65.0,
        "temperature_c": 26.0,
        "wind_speed_ms": 10.0,
        "pressure_hpa": 1004.0,
        "humidity_pct": 92.0,
        "lat": 19.0,
        "lon": 72.8,
        "lead_time": 24,
        "month": 7,
        "regime_prob": 0.85,
        "lstm_0": 0.5,
        "lstm_1": -0.2,
        "recent_mae_72h": 2.8
    }])
    weights_rain = engine.predict_weights(df_rain)[0]

    # Test case 2: Dry high wind condition
    df_wind = pd.DataFrame([{
        "spread": 1.5,
        "rainfall_mm": 0.0,
        "temperature_c": 32.0,
        "wind_speed_ms": 22.0,
        "pressure_hpa": 1010.0,
        "humidity_pct": 40.0,
        "lat": 26.0,
        "lon": 91.7,
        "lead_time": 24,
        "month": 4,
        "regime_prob": 0.80,
        "lstm_0": -0.3,
        "lstm_1": 0.4,
        "recent_mae_72h": 1.5
    }])
    weights_wind = engine.predict_weights(df_wind)[0]

    # Verify weights are strictly non-negative and sum to 1.0
    for w_dict in (weights_rain, weights_wind):
        for model_name, w in w_dict.items():
            assert w > 0.0, f"Weight for {model_name} must be positive"
        total = sum(w_dict.values())
        assert np.isclose(total, 1.0, atol=0.01), f"Weights must sum to 1.0, got {total}"

    # Verify weights are DYNAMIC (not fixed constants!)
    assert weights_rain != weights_wind, "Weights must vary dynamically depending on weather features"


def test_bias_corrector():
    corrector = BiasCorrector()
    corrector.bias_table[("rainfall_mm", "IN_ALL", "HEAVY_RAIN", 24)] = 2.4
    calibrated, applied = corrector.calibrate(50.0, "rainfall_mm", "IN_ALL", "HEAVY_RAIN", 24)
    assert calibrated < 50.0
    assert applied > 0.0


def test_confidence_and_extreme_risk():
    conf_pct, tier, drivers = CalibratedConfidenceFormulator.calculate_confidence(
        spread=3.2,
        mean_forecast=45.0,
        recent_mae=2.5,
        regime_prob=0.85,
        lead_time_hours=24
    )
    assert 15.0 <= conf_pct <= 98.0
    assert tier in ("High", "Moderate", "Low")
    assert len(drivers) > 0

    risk_engine = ExtremeRiskEngine()
    risks = risk_engine.compute_risk_probabilities(
        blended_forecast=72.0,
        variable="rainfall_mm",
        regime="HEAVY_RAIN",
        regime_prob=0.88,
        spread=5.0,
        temp_c=27.0,
        wind_ms=12.0,
        rain_mm=72.0
    )
    assert "HEAVY_RAIN" in risks
    assert risks["HEAVY_RAIN"].risk_level in ("HIGH", "EXTREME")
    assert risks["HEAVY_RAIN"].probability_pct > 60.0
