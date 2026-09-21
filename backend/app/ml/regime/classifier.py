"""
AETHER Weather Regime Classifier
Classifies current atmospheric conditions into synoptic weather regimes:
- NORMAL
- HEAVY_RAIN
- HEAT
- HIGH_WIND
- DRY
- EXTREME

Uses an XGBoost multi-class classifier with calibrated probability outputs.
The resulting regime probability distribution serves as an upstream feature for:
1. Adaptive XGBoost Weighting Engine
2. Extreme-Weather Risk Engine
"""
import os
import pickle
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from xgboost import XGBClassifier

REGIME_CLASSES = ["NORMAL", "HEAVY_RAIN", "HEAT", "HIGH_WIND", "DRY", "EXTREME"]
REGIME_TO_IDX = {name: idx for idx, name in enumerate(REGIME_CLASSES)}
IDX_TO_REGIME = {idx: name for idx, name in enumerate(REGIME_CLASSES)}

REGIME_FEATURE_COLS = [
    "temperature_c",
    "rainfall_mm",
    "wind_speed_ms",
    "pressure_hpa",
    "humidity_pct",
    "spread",
    "lat",
    "lon",
    "month",
    "day_of_year"
]


class WeatherRegimeClassifier:
    """XGBoost Classifier for synoptic weather regime detection."""

    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            objective="multi:softprob",
            num_class=len(REGIME_CLASSES),
            random_state=42,
            eval_metric="mlogloss"
        )
        self.is_trained = False

    def train(self, X: pd.DataFrame, y_labels: List[str]) -> Dict[str, float]:
        """
        Trains the XGBoost classifier on historical atmospheric features.
        y_labels: List of regime strings e.g. 'NORMAL', 'HEAVY_RAIN', etc.
        """
        X_feats = X[REGIME_FEATURE_COLS].copy()
        # Handle missing pressure/humidity safely
        X_feats["pressure_hpa"] = X_feats["pressure_hpa"].fillna(1013.25)
        X_feats["humidity_pct"] = X_feats["humidity_pct"].fillna(65.0)
        X_feats["spread"] = X_feats["spread"].fillna(0.0)

        y_idx = np.array([REGIME_TO_IDX.get(lbl, 0) for lbl in y_labels])

        self.model.fit(X_feats, y_idx)
        self.is_trained = True

        train_acc = float(np.mean(self.model.predict(X_feats) == y_idx))
        return {"train_accuracy": round(train_acc, 3)}

    def predict_regime_probabilities(self, X: pd.DataFrame) -> List[Dict[str, float]]:
        """
        Returns full probability distribution over the 6 regimes for each input row.
        """
        X_feats = X[REGIME_FEATURE_COLS].copy()
        X_feats["pressure_hpa"] = X_feats["pressure_hpa"].fillna(1013.25)
        X_feats["humidity_pct"] = X_feats["humidity_pct"].fillna(65.0)
        X_feats["spread"] = X_feats["spread"].fillna(0.0)

        if not self.is_trained:
            # Physically grounded heuristic fallback prior to model training
            results = []
            for _, row in X_feats.iterrows():
                probs = {r: 0.05 for r in REGIME_CLASSES}
                if row["rainfall_mm"] > 50.0:
                    probs["HEAVY_RAIN"] = 0.75
                elif row["temperature_c"] > 40.0:
                    probs["HEAT"] = 0.75
                elif row["wind_speed_ms"] > 16.0:
                    probs["HIGH_WIND"] = 0.70
                elif row["humidity_pct"] < 25.0:
                    probs["DRY"] = 0.65
                else:
                    probs["NORMAL"] = 0.70

                # Normalize
                total = sum(probs.values())
                results.append({k: round(v / total, 3) for k, v in probs.items()})
            return results

        raw_probs = self.model.predict_proba(X_feats)
        results = []
        for p_row in raw_probs:
            prob_dict = {IDX_TO_REGIME[idx]: round(float(p_row[idx]), 3) for idx in range(len(REGIME_CLASSES))}
            results.append(prob_dict)
        return results

    def predict_dominant_regime(self, X: pd.DataFrame) -> List[Tuple[str, float]]:
        """Returns list of (dominant_regime_name, confidence_probability)."""
        prob_dicts = self.predict_regime_probabilities(X)
        dominant = []
        for p in prob_dicts:
            best_regime = max(p.items(), key=lambda item: item[1])
            dominant.append(best_regime)
        return dominant

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump(self.model, f)

    def load(self, filepath: str):
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                self.model = pickle.load(f)
            self.is_trained = True
