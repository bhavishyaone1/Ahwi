# AETHER — Adaptive Hybrid Weather Intelligence & Forecast Blending

> **Meteorological AI that learns when to trust each weather model.**

AETHER is an adaptive meteorological intelligence platform for dynamic multi-model NWP & AI blending over the Indian subcontinent.

Unlike traditional static averaging or single-model reliance, AETHER dynamically evaluates physics-based NWP models (ECMWF IFS, NOAA GFS) alongside cutting-edge AI forecast models (ECMWF AIFS). By learning historical forecast errors across regions, seasons, lead times (6h–72h), and synoptic weather regimes, AETHER computes dynamic model weights, generates calibrated blended predictions, quantifies uncertainty, assesses extreme weather risks, and provides explainable SHAP guidance.

---

## 🌟 Core Pillars & Key Capabilities

1. **Adaptive Model Intelligence**: AI learns which forecast source performs best for each geographic cell, season, horizon, and atmospheric regime.
2. **Historical & Sequence Memory**: Causal multi-window error tracking (24h, 72h, 7d, 30d) coupled with a causal PyTorch LSTM temporal memory.
3. **Calibrated Confidence & Extreme Risk**: Empirical uncertainty quantification and extreme event risk classification (Heavy Rain, Heatwave, Gale Wind) with probabilistic hazard guidance.
4. **Explainable Operational AI**: Tree-based SHAP attribution explaining the exact atmospheric factors driving model trust.
5. **Grounded Operator Copilot ("Ask AETHER")**: Natural language operator query engine grounded in real pipeline data with zero hallucination.

---

## 🏛️ End-to-End Pipeline Architecture

```
                  ┌───────────────────────┐
                  │   FORECAST SOURCES    │
                  │ ECMWF │ AIFS │ GFS    │
                  └───────────┬───────────┘
                              ↓
                     DATA ALIGNMENT (0.25°)
                              ↓
               ┌──────────────┴──────────────┐
               ↓                             ↓
        CURRENT ATMOSPHERE             ERROR MEMORY
               ↓                             ↓
        REGIME XGBOOST                  LSTM 72h
               └──────────────┬──────────────┘
                              ↓
                    ADAPTIVE XGBOOST
                              ↓
                     SOFTMAX WEIGHTS
                              ↓
                   HYBRID BLENDED FORECAST
                              ↓
                    BIAS CALIBRATION
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
        UNCERTAINTY                       EXTREME RISK
              ↓                               ↓
              └───────────────┬───────────────┘
                              ↓
                          SHAP EXPLAINER
                              ↓
                         FASTAPI BACKEND
                              ↓
                     NEXT.JS 14 WORKSTATION
```

---

## 🔬 Tech Stack

- **Backend & ML**: Python 3.11, FastAPI, SQLAlchemy 2.0, XGBoost, PyTorch, Scikit-learn, SHAP, NumPy, Pandas, SciPy
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, MapLibre GL JS, Recharts, Motion, Sonner, Radix UI
- **Data Persistence**: SQLite (local zero-setup) / PostgreSQL + PostGIS (production)

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Setup Python virtual environment
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run full ML & API test suite (18 tests)
pytest

# Launch FastAPI Backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Interactive Swagger Docs at [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)).

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server with hot-reload
npm run dev

# Or build and run production server
npm run build
npm start
```
Frontend Workstation will be live at: [http://localhost:3000](http://localhost:3000).

---

## 🖥️ Workstation Screens

1. **`/` Overview Situation Room**: Interactive MapLibre GL synoptic map, quick parameter pills (Precipitation / Temperature / Wind), horizon scrubber (+6h to +72h), station selector, dynamic model trust bars, confidence score, and operational event stream.
2. **`/forecast` Multi-Horizon Exploration**: 6h–72h comparison curves (AETHER Blend vs ECMWF vs AIFS vs GFS), ensemble table, and uncertainty envelopes.
3. **`/models` Model Intelligence**: Model performance table, bias metrics, and live SHAP Waterfall attribution.
4. **`/weight-map` Spatial Reliability**: India-wide geographic dominance map displaying dynamic model trust across 10 reference stations at 0.25° resolution.
5. **`/climate` 30-Year Climatology**: Historical percentile normal envelope curves and anomaly quantification against ERA5 baseline.
6. **`/risk` Extreme Risk Matrix**: Calibrated probabilities for Heavy Rain, Heatwave, and Gale Wind with operational hazard protocols.
7. **`/ask` Ask AETHER Assistant**: Grounded natural language query engine retrieving verified pipeline values with zero hallucination.
8. **`/benchmark` Verification & Skill Benchmarks**: Lead-time skill curves (MAE vs horizon) and backtest validation matrix benchmarking AETHER against Persistence, Raw Models, Equal Weight, and Static Blends.

---

## ☁️ Cloud Deployment

### Docker Deployment
```bash
# Build and start both services
docker-compose up --build
```

### Environment Variables
| Variable | Description | Default |
|---|---|---|
| `AETHER_DATA_MODE` | Ingestion mode: `REAL` or `DEMO` | `DEMO` |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///backend/aether.db` |
| `BACKEND_URL` | Backend URL for Next.js API proxy | `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_API_URL` | Public API endpoint for direct client requests | `/api` |

---

## 📄 License
Licensed under the Apache 2.0 License.
