"""
AETHER Base Weather Data Adapter Interface
Guarantees a unified, interchangeable interface for both live open data and offline scenario adapters.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional
from backend.app.schemas.forecast_schema import ForecastRecord, ObservationRecord


class BaseWeatherAdapter(ABC):
    """Abstract base class for all meteorological ingestion adapters."""

    @abstractmethod
    def get_mode(self) -> str:
        """Returns 'REAL' or 'DEMO'."""
        pass

    @abstractmethod
    def get_source_name(self) -> str:
        """Returns descriptive name of data source."""
        pass

    @abstractmethod
    def fetch_forecasts(
        self,
        variables: List[str],
        horizons: List[int],
        start_time: datetime,
        end_time: datetime,
        bbox: Optional[Dict[str, float]] = None,
        locations: Optional[List[Dict[str, float]]] = None
    ) -> List[ForecastRecord]:
        """Fetches normalized forecast records from the source."""
        pass

    @abstractmethod
    def fetch_observations(
        self,
        variables: List[str],
        start_time: datetime,
        end_time: datetime,
        bbox: Optional[Dict[str, float]] = None,
        locations: Optional[List[Dict[str, float]]] = None
    ) -> List[ObservationRecord]:
        """Fetches normalized ground truth observation records."""
        pass
