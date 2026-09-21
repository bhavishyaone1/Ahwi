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

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/bhavishyaone1/AETHER.git
cd AETHER

# Activate Python 3.11 venv
.\venv\Scripts\Activate.ps1

# Run tests
pytest backend/tests

# Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License & Attribution
Developed for Smart India Hackathon 2024/2026 Problem Statement 26081 (MoES / NCMRWF).
Licensed under the Apache 2.0 License.
