"""
AETHER Causal PyTorch LSTM Temporal Feature Extractor
Processes historical sequence of the past 72 hours (observed weather + past model forecast errors).
Strictly unidirectional: zero future observation or future forecast error enters the sequence.
Produces an 8-dimensional latent temporal context embedding z_t for the XGBoost weighting engine.
"""
import os
from typing import Dict, List, Optional
import numpy as np
import torch
import torch.nn as nn


class CausalWeatherLSTM(nn.Module):
    """
    2-layer unidirectional causal LSTM mapping a 72-hour sequence of atmospheric
    measurements and past model errors into an 8-dimensional temporal context representation.
    """

    def __init__(self, input_dim: int = 8, hidden_dim: int = 32, num_layers: int = 2, output_dim: int = 8):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim

        # Strictly unidirectional to ensure strict causality and anti-leakage
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=False
        )
        self.proj = nn.Linear(hidden_dim, output_dim)
        self.act = nn.Tanh()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x shape: (batch_size, seq_len, input_dim) e.g., (B, 12, 8) for 72h at 6h intervals.
        returns: (batch_size, output_dim) e.g., (B, 8)
        """
        _, (hn, _) = self.lstm(x)
        # hn[-1] is the last layer's hidden state at the final causal timestep
        out = self.act(self.proj(hn[-1]))
        return out


class LSTMTemporalExtractor:
    """Wrapper handling tensor formatting, feature normalization, and inference."""

    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = CausalWeatherLSTM().to(self.device)
        self.model.eval()
        self.model_path = model_path
        if model_path and os.path.exists(model_path):
            self.load(model_path)

    def extract_temporal_features(self, sequence_matrix: np.ndarray) -> np.ndarray:
        """
        Accepts a (batch_size, 12, 8) or (12, 8) numpy array of historical 72h sequence:
        Columns: [rain, temp, wind, pressure, humidity, ecmwf_err, aifs_err, gfs_err]
        Returns: (batch_size, 8) or (8,) latent temporal vector z_t.
        """
        is_single = (sequence_matrix.ndim == 2)
        if is_single:
            sequence_matrix = np.expand_dims(sequence_matrix, axis=0)

        # Basic robust standard scaling
        scaled = np.nan_to_num(sequence_matrix, nan=0.0)
        # Normalize roughly to [-2, 2]
        scaled[:, :, 0] = np.clip(scaled[:, :, 0] / 50.0, 0.0, 4.0)   # rain
        scaled[:, :, 1] = (scaled[:, :, 1] - 25.0) / 15.0              # temp
        scaled[:, :, 2] = np.clip(scaled[:, :, 2] / 15.0, 0.0, 3.0)   # wind
        scaled[:, :, 3] = (scaled[:, :, 3] - 1013.0) / 20.0            # pressure
        scaled[:, :, 4] = (scaled[:, :, 4] - 60.0) / 30.0              # humidity
        scaled[:, :, 5] = np.clip(scaled[:, :, 5] / 10.0, -3.0, 3.0)  # ecmwf err
        scaled[:, :, 6] = np.clip(scaled[:, :, 6] / 10.0, -3.0, 3.0)  # aifs err
        scaled[:, :, 7] = np.clip(scaled[:, :, 7] / 10.0, -3.0, 3.0)  # gfs err

        tensor = torch.tensor(scaled, dtype=torch.float32).to(self.device)
        with torch.no_grad():
            emb = self.model(tensor).cpu().numpy()

        return emb[0] if is_single else emb

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        torch.save(self.model.state_dict(), filepath)

    def load(self, filepath: str):
        if os.path.exists(filepath):
            self.model.load_state_dict(torch.load(filepath, map_location=self.device))
            self.model.eval()
