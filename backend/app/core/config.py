"""
AETHER Configuration Module
Centralized settings for data modes, analysis grids, and model parameters.
"""
import os
from pathlib import Path
from typing import List, Dict


class Settings:
    APP_NAME: str = "AETHER — Adaptive Hybrid Weather Intelligence"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    # Operational Data Mode: "REAL" or "DEMO"
    # In DEMO mode, the SyntheticScenarioAdapter runs through the EXACT SAME ML pipeline
    DATA_MODE: str = os.getenv("AETHER_DATA_MODE", "DEMO")

    # Target Standardized Analysis Grid
    TARGET_GRID_RESOLUTION: float = 0.25  # degrees (~27 km over India)
    INDIA_BBOX: Dict[str, float] = {
        "min_lat": 6.0,
        "max_lat": 38.0,
        "min_lon": 68.0,
        "max_lon": 98.0
    }

    # Key Indian Meteorological Reference Stations
    REFERENCE_LOCATIONS = [
        {"name": "Delhi NCR", "lat": 28.6139, "lon": 77.2090, "region": "North"},
        {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "region": "West Coast"},
        {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "region": "South East"},
        {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "region": "East"},
        {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "region": "South Interior"},
        {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867, "region": "Deccan"},
        {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714, "region": "West"},
        {"name": "Guwahati", "lat": 26.1445, "lon": 91.7362, "region": "Northeast"},
        {"name": "Bhubaneswar", "lat": 20.2961, "lon": 85.8245, "region": "East Coast"},
        {"name": "Shimla", "lat": 31.1048, "lon": 77.1734, "region": "Western Himalayas"},
    ]

    # Configurable Historical Error Memory Windows (hours)
    # 24h, 72h, 7-day (168h), 30-day (720h)
    ERROR_MEMORY_WINDOWS: List[int] = [24, 72, 168, 720]

    # Database URL: defaults to SQLite for zero-friction local execution, supports PostgreSQL/PostGIS
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR.parent / "data"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'aether.db'}")

    # Chronological Split Boundary Dates
    TRAIN_START: str = "2018-01-01"
    TRAIN_END: str = "2022-12-31"
    VAL_START: str = "2023-01-01"
    VAL_END: str = "2023-12-31"
    TEST_START: str = "2024-01-01"
    TEST_END: str = "2025-12-31"


settings = Settings()
