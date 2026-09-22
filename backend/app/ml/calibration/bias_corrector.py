"""
AETHER Variable-Specific Regional Bias Calibration
Computes and applies:
F_calibrated = F_blend - Bias(blend, variable, region, regime, lead_time)
Guarantees physical boundaries (non-negative rainfall and wind).
"""
from typing import Dict, Tuple
import numpy as np


class BiasCorrector:
    """Stores and applies empirical residual bias calibrations."""

    def __init__(self):
        # Key: (variable, region, regime, lead_time) -> mean_bias
        self.bias_table: Dict[Tuple[str, str, str, int], float] = {}

    def fit_bias_table(
        self,
        observations: np.ndarray,
        blended_forecasts: np.ndarray,
        variables: np.ndarray,
        regions: np.ndarray,
        regimes: np.ndarray,
        lead_times: np.ndarray
    ):
        """Calculates mean empirical bias across validation segments."""
        errors = blended_forecasts - observations
        unique_keys = set(zip(variables, regions, regimes, lead_times))

        for var, reg, regime, lt in unique_keys:
            mask = (
                (variables == var) &
                (regions == reg) &
                (regimes == regime) &
                (lead_times == lt)
            )
            if np.sum(mask) >= 3:
                self.bias_table[(var, reg, regime, int(lt))] = float(np.mean(errors[mask]))
            else:
                self.bias_table[(var, reg, regime, int(lt))] = 0.0

    def calibrate(
        self,
        raw_blend: float,
        variable: str,
        region: str = "IN_ALL",
        regime: str = "NORMAL",
        lead_time: int = 24
    ) -> Tuple[float, float]:
        """
        Applies bias correction:
        Returns (calibrated_value, bias_correction_applied)
        """
        bias = self.bias_table.get((variable, region, regime, lead_time), 0.0)
        # Apply gentle shrinkage to avoid overcorrection on noisy small samples
        shrunk_bias = round(bias * 0.75, 2)
        calibrated = raw_blend - shrunk_bias

        # Physical lower bounds
        if variable in ("rainfall_mm", "wind_speed_ms"):
            calibrated = max(0.0, calibrated)

        return round(float(calibrated), 2), shrunk_bias

    def save(self, filepath: str):
        import os
        import pickle
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump(self.bias_table, f)

    def load(self, filepath: str):
        import os
        import pickle
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                self.bias_table = pickle.load(f)
