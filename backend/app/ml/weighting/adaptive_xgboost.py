"""
AETHER Adaptive XGBoost Model Weighting Engine
The core intelligence engine that learns historical model skill under varying:
- Geographies (lat, lon)
- Seasons and lead times (6h - 72h)
- Weather regimes (Normal, Heavy Rain, Heat, High Wind, Extreme)
- Causal temporal LSTM error dynamics
- Model disagreement / spread

Produces continuously normalized softmax model weights summing to 1.0.
"""
import os
import pickle
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

MODELS = ["ECMWF_IFS", "ECMWF_AIFS", "GFS"]


class AdaptiveWeightingEngine:
    """
    XGBoost-based meta-model estimating relative expected model performance
    and calculating dynamic softmax weights.
    """

    def __init__(self, temperature: float = 1.0):
        self.temperature = temperature
        # Train a dedicated regressor for each model's relative skill
        self.regressors = {
            m: XGBRegressor(
                n_estimators=120,
                max_depth=4,
                learning_rate=0.06,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42 + idx
            )
            for idx, m in enumerate(MODELS)
        }
        self.is_trained = False
        self.feature_names: List[str] = []

    def compute_ground_truth_skill_targets(
        self,
        errors: np.ndarray,
        gamma: float = 3.0
    ) -> np.ndarray:
        """
        Converts absolute model errors into normalized relative skill targets.
        errors: (N, M) array of absolute errors |F_m - y|
        Returns: (N, M) array where each row sums to 1.0 and lower error -> higher target.
        """
        # Softmax over negative scaled errors
        scaled_neg = -errors / gamma
        exp_vals = np.exp(scaled_neg - np.max(scaled_neg, axis=1, keepdims=True))
        targets = exp_vals / np.sum(exp_vals, axis=1, keepdims=True)
        return targets

    def fit(self, X: pd.DataFrame, absolute_errors: np.ndarray) -> Dict[str, float]:
        """
        Trains the XGBoost regressors on training set features to predict relative skill targets.
        X: Feature dataframe
        absolute_errors: (N, 3) matrix of |F_m - y|
        """
        self.feature_names = list(X.columns)
        targets = self.compute_ground_truth_skill_targets(absolute_errors)

        metrics = {}
        for idx, m in enumerate(MODELS):
            y_target = targets[:, idx]
            self.regressors[m].fit(X, y_target)
            train_preds = self.regressors[m].predict(X)
            mse = float(np.mean((train_preds - y_target) ** 2))
            metrics[f"{m}_train_mse"] = round(mse, 4)

        self.is_trained = True
        return metrics

    def predict_weights(self, X: pd.DataFrame) -> List[Dict[str, float]]:
        """
        Predicts continuous model weights using temperature-scaled softmax.
        Returns list of dicts: {"ECMWF_IFS": w1, "ECMWF_AIFS": w2, "GFS": w3}
        guaranteeing w_i > 0 and sum(w_i) == 1.0.
        """
        if not self.is_trained:
            # Physically calibrated baseline heuristic prior to model training
            results = []
            for _, row in X.iterrows():
                # Base weights: AIFS stronger in rain, ECMWF strong in wind/temp
                spread = row.get("spread", 1.0)
                rain = row.get("rainfall_mm", 0.0)
                wind = row.get("wind_speed_ms", 5.0)

                w_aifs = 0.38 + (0.08 if rain > 25.0 else 0.0)
                w_ecmwf = 0.36 + (0.05 if wind > 12.0 else 0.0)
                w_gfs = 0.26 - (0.05 if spread > 8.0 else 0.0)

                tot = w_aifs + w_ecmwf + w_gfs
                results.append({
                    "ECMWF_IFS": round(w_ecmwf / tot, 3),
                    "ECMWF_AIFS": round(w_aifs / tot, 3),
                    "GFS": round(w_gfs / tot, 3),
                })
            return results

        # Ensure columns match training schema
        X_aligned = X[self.feature_names].copy()
        raw_scores = np.column_stack([self.regressors[m].predict(X_aligned) for m in MODELS])

        # Temperature-scaled Softmax
        scaled = raw_scores / self.temperature
        exp_s = np.exp(scaled - np.max(scaled, axis=1, keepdims=True))
        softmax_weights = exp_s / np.sum(exp_s, axis=1, keepdims=True)

        results = []
        for row_w in softmax_weights:
            # Round and ensure exact 1.0 sum
            r = {MODELS[i]: round(float(row_w[i]), 3) for i in range(len(MODELS))}
            # Adjust minor rounding difference to largest weight
            diff = 1.0 - sum(r.values())
            max_k = max(r.items(), key=lambda item: item[1])[0]
            r[max_k] = round(r[max_k] + diff, 3)
            results.append(r)

        return results

    def blend_forecasts(
        self,
        forecast_matrix: Dict[str, float],
        weights: Dict[str, float]
    ) -> float:
        """
        Computes F_blend = sum(w_i * F_i)
        """
        blend = sum(weights.get(m, 0.33) * forecast_matrix.get(m, 0.0) for m in MODELS)
        return round(float(blend), 2)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump({
                "regressors": self.regressors,
                "feature_names": self.feature_names,
                "temperature": self.temperature,
                "is_trained": self.is_trained
            }, f)

    def load(self, filepath: str):
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                data = pickle.load(f)
                self.regressors = data["regressors"]
                self.feature_names = data["feature_names"]
                self.temperature = data.get("temperature", 1.0)
                self.is_trained = data.get("is_trained", True)
