"""
AETHER Data Adapter Factory
Selects appropriate data adapter based on configured operational mode (REAL or DEMO).
"""
import logging
from backend.app.core.config import settings
from backend.app.data.base_adapter import BaseWeatherAdapter
from backend.app.data.ingestion.real_adapter import RealDataAdapter
from backend.app.data.scenarios.synthetic_adapter import SyntheticScenarioAdapter

logger = logging.getLogger("aether.adapter_factory")


def get_data_adapter(force_mode: str = None) -> BaseWeatherAdapter:
    """
    Returns the active adapter.
    If force_mode is specified, uses that mode; otherwise uses settings.DATA_MODE.
    """
    mode = (force_mode or settings.DATA_MODE).upper()
    if mode == "REAL":
        logger.info("Initializing RealDataAdapter (Production mode)")
        return RealDataAdapter()
    else:
        logger.info("Initializing SyntheticScenarioAdapter (Hackathon DEMO mode)")
        return SyntheticScenarioAdapter()
