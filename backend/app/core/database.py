"""
AETHER Database Engine & SQLAlchemy 2.0 ORM Models
Compatible with SQLite (development/local demonstration) and PostgreSQL/PostGIS (production).
"""
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Index
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

Base = declarative_base()


class ForecastDataTable(Base):
    __tablename__ = "forecast_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    model = Column(String(32), nullable=False, index=True)  # ECMWF_IFS, ECMWF_AIFS, GFS, NCUM
    variable = Column(String(32), nullable=False, index=True)  # rainfall_mm, temperature_c, wind_speed_ms
    lead_time_hours = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    pressure_hpa = Column(Float, nullable=True)
    humidity_pct = Column(Float, nullable=True)
    data_mode = Column(String(16), default="REAL")
    data_source = Column(String(64), default="ECMWF_OPEN_DATA")

    __table_args__ = (
        Index("idx_forecast_lookup", "latitude", "longitude", "variable", "lead_time_hours", "timestamp"),
    )


class ObservationsTable(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    variable = Column(String(32), nullable=False, index=True)
    actual_value = Column(Float, nullable=False)
    source = Column(String(64), nullable=False)  # IMD_GRIDDED, ERA5, SYNTHETIC_SCENARIO
    data_mode = Column(String(16), default="REAL")

    __table_args__ = (
        Index("idx_obs_lookup", "latitude", "longitude", "variable", "timestamp"),
    )


class ModelPerformanceTable(Base):
    __tablename__ = "model_performance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model = Column(String(32), nullable=False, index=True)
    region_id = Column(String(32), nullable=False)
    variable = Column(String(32), nullable=False)
    season = Column(String(32), nullable=False)
    lead_time_hours = Column(Integer, nullable=False)
    weather_regime = Column(String(32), nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    bias = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    sample_count = Column(Integer, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
    data_mode = Column(String(16), default="REAL")


class BlendWeightsTable(Base):
    __tablename__ = "blend_weights"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    variable = Column(String(32), nullable=False)
    lead_time_hours = Column(Integer, nullable=False)
    model = Column(String(32), nullable=False)
    weight = Column(Float, nullable=False)
    data_mode = Column(String(16), default="REAL")


class PredictionsTable(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    variable = Column(String(32), nullable=False)
    lead_time_hours = Column(Integer, nullable=False)
    blended_forecast = Column(Float, nullable=False)
    calibrated_forecast = Column(Float, nullable=False)
    confidence_pct = Column(Float, nullable=False)
    dominant_model = Column(String(32), nullable=False)
    detected_regime = Column(String(32), nullable=False)
    data_mode = Column(String(16), default="REAL")


class ExtremeRiskTable(Base):
    __tablename__ = "extreme_risk"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    lead_time_hours = Column(Integer, nullable=False)
    heavy_rain_prob = Column(Float, nullable=False)
    heat_prob = Column(Float, nullable=False)
    high_wind_prob = Column(Float, nullable=False)
    overall_risk = Column(String(16), nullable=False)
    data_mode = Column(String(16), default="REAL")


# Database engine initialization
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes tables in database."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
