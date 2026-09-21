# AETHER — Adaptive Hybrid Weather Intelligence & Forecast Blending

> **AI that learns when to trust each weather model.**

AETHER is an adaptive meteorological intelligence platform developed for **Smart India Hackathon (SIH) Problem Statement 26081**: *Hybrid AI–NWP Multi-Model Forecast Blending System*.

Unlike traditional static averaging or single-model reliance, AETHER dynamically evaluates physics-based NWP models (ECMWF IFS, NOAA GFS) alongside cutting-edge AI forecast models (ECMWF AIFS). By learning historical forecast errors across regions, seasons, lead times (6h–72h), and synoptic weather regimes, AETHER computes dynamic model weights, generates calibrated blended predictions, quantifies uncertainty, assesses extreme weather risks, and provides explainable SHAP guidance.

---

## 🌟 Core Pillars & USPs

1. **Adaptive Model Intelligence**: AI learns which forecast source performs best for each geographic cell, season, horizon, and atmospheric regime.
2. **Historical & Sequence Memory**: Causal multi-window error tracking (24h, 72h, 7d, 30d) coupled with a causal PyTorch LSTM temporal memory.
3. **Calibrated Confidence & Extreme Risk**: Empirical uncertainty quantification and extreme event risk classification (Heavy Rain, Heatwave, Gale Wind) clearly marked as model risk guidance.
4. **Explainable Operational AI**: Tree-based SHAP attribution explaining the exact atmospheric factors driving model trust.

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
                     NEXT.JS DASHBOARD
```

---

## 🔬 Tech Stack

- **Backend & ML**: Python 3.11, FastAPI, SQLAlchemy 2.0, XGBoost, PyTorch, Scikit-learn, SHAP, NumPy, Pandas, SciPy
- **Frontend**: Next.js 14/15, React, TypeScript, Tailwind CSS, MapLibre GL JS, Recharts, Framer Motion
- **Persistence**: SQLite (local) / PostgreSQL + PostGIS (production)

---

## 🚀 Quick Start

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone & Setup Backend
```bash
git clone https://github.com/bhavishyaone1/Ather.git
cd Ather

# Setup Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# Run full ML & API test suite (16 tests)
pytest backend/tests

# Launch FastAPI Backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Interactive Swagger Docs at `/api/docs`).

### 2. Launch Next.js Workstation
```bash
cd frontend
npm install
npm run build
npm start
```
Workstation will be live at: [http://localhost:3000](http://localhost:3000)

---

## 🖥️ Workstation Screens

1. **`/` Overview Situation Room**: Interactive synoptic map, situation hero summary, dynamic model trust bars, confidence score, and extreme risk alert.
2. **`/forecast` Multi-Horizon Exploration**: 6h–72h comparison curves (AETHER Blend vs ECMWF vs AIFS vs GFS).
3. **`/models` Model Intelligence**: Model performance radar, bias metrics, and live SHAP Waterfall attribution.
4. **`/weight-map` Spatial Reliability**: India-wide geographic dominance map displaying dynamic model trust by subdivision.
5. **`/climate` 30-Year Climatology**: Historical percentile normal envelope curves and anomaly quantification.
6. **`/risk` Extreme Risk Matrix**: Calibrated probabilities for Heavy Rain, Heatwave, and Gale Wind with mandatory IMD advisory disclaimers.
7. **`/ask` Ask AETHER Assistant**: Grounded natural language query engine retrieving verified pipeline values with zero hallucination.
8. **`/benchmark` SIH Judges Matrix**: Backtest validation matrix benchmarking AETHER against Persistence, Raw Models, Equal Weight, and Static Blends.

---

## 📄 License & Attribution
Developed for Smart India Hackathon (SIH) Problem Statement 26081 (MoES / NCMRWF).
Licensed under the Apache 2.0 License.

