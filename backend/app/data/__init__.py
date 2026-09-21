"""AETHER Data Ingestion & Scenarios Package"""
from backend.app.data.base_adapter import BaseWeatherAdapter
from backend.app.data.adapter_factory import get_data_adapter
from backend.app.data.ingestion.real_adapter import RealDataAdapter
from backend.app.data.scenarios.synthetic_adapter import SyntheticScenarioAdapter

__all__ = [
    "BaseWeatherAdapter",
    "get_data_adapter",
    "RealDataAdapter",
    "SyntheticScenarioAdapter",
]
