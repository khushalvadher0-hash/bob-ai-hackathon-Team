# Container Congestion Predictor & Port Operations Optimiser

[![Status](https://img.shields.io/badge/Status-Demo--Ready-success.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)]()
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)]()
[![scikit--learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E.svg)]()

## 📌 Problem Statement
Modern global container ports face severe bottleneck congestion resulting from clustered vessel arrival schedules, limited deepwater berths, and unbalanced terminal utilization. Port shift supervisors lack centralized predictive intelligence to foresee queue build-ups and automate resource-balanced 72-hour operational schedules.

## 🚀 Solution Overview
The **Container Congestion Predictor & Port Operations Optimiser** is an end-to-end decision support platform that:
1. **Predicts Congestion Risk**: Uses an explainable Random Forest ML model to classify terminal congestion (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
2. **Recommends Alternate Routing**: Calculates dynamic composite route penalties to divert vessels to underutilized berths before queues form.
3. **Optimizes Berth & Crane Allocations**: Runs a priority-aware greedy scheduling engine to allocate berths and cranes without temporal overlap.
4. **Generates 72-Hour Operations Plans**: Delivers actionable shift schedules for port superintendents.

---

## 🏗️ Architecture & Flow
```
React Frontend (Vite)
       │
       ▼  (Axios REST)
FastAPI Backend (/api)
       │
       ▼
Service Layer (vessel, congestion, routing, operations)
       │
       ├──► ML Engine (Random Forest Congestion Classifier)
       ├──► Routing Engine (Multi-criteria Scoring)
       └──► Optimization Engine (Greedy Berth & Crane Scheduler)
       │
       ▼
72-Hour Planner & Data Store (SQLite / CSV)
```

---

## 🛠️ Tech Stack
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, pandas, NumPy, scikit-learn, SQLite, python-dotenv
- **Frontend**: React 18, Vite, React Router, Recharts, Lucide React, Glassmorphic CSS
- **Testing**: pytest, httpx

---

## 📂 Repository Structure
```
├── backend/
│   ├── api/             # FastAPI REST endpoints
│   ├── models/          # Pydantic data schemas
│   ├── services/        # Decoupled business logic
│   ├── ml/              # Preprocessing, feature engineering & model training
│   ├── optimization/    # Berth, crane & schedule optimizers
│   ├── routing/         # Route engine & multi-attribute scoring
│   ├── planner/         # 72-Hour operational horizon generator
│   ├── data/            # Realistic synthetic CSV datasets
│   ├── database/        # SQLite connection and migration scripts
│   ├── tests/           # Independent unit test suites
│   ├── main.py          # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI widgets (cards, tables, badges)
│   │   ├── pages/       # Dashboard, Vessels, Congestion, Routing, Operations
│   │   ├── services/    # Centralized Axios API client
│   │   ├── hooks/       # useApi reactive hook
│   │   └── utils/       # Date formatting & status helpers
│   ├── package.json
│   └── vite.config.js
├── docs/                # Architecture, API, ML & optimization specs
└── demo/                # Sample input and output JSON artifacts
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
# From workspace root
pip install -r backend/requirements.txt

# Run ML model training
python -m backend.ml.train_model

# Launch FastAPI Dev Server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be accessible at: `http://127.0.0.1:8000`  
Swagger API Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard will be live at: `http://localhost:5173`

---

## 🧪 Running Tests
```bash
python -m pytest backend/tests/ -v
```

---

## 👥 Team & Module Responsibilities (4-Member Git Branching)
| Member | Git Feature Branch | Module Responsibility |
|---|---|---|
| **Member 1** | `feature/congestion-prediction` | ML preprocessing, feature engineering, model training, and prediction API |
| **Member 2** | `feature/alternate-routing` | Route scoring heuristics, terminal evaluation, and rerouting advice |
| **Member 3** | `feature/optimization` | Berth & crane greedy algorithms, turnaround estimations, and 72-hour planning |
| **Member 4** | `feature/frontend-dashboard` | React SPA, glassmorphic UI, charts, tables, and API integration |

---

## 🔮 Future Enhancements
- AIS real-time telemetry stream ingestion
- Non-linear integer programming (MIP / CP-SAT) for advanced berth optimization
- Multi-port regional coordination for container transshipment
