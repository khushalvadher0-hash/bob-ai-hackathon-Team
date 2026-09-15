# 🚀 Container Congestion Predictor & Port Operations Optimiser

> Intelligent port congestion forecasting, alternative berth routing, and 72-hour operational planning platform.

[![Status](https://img.shields.io/badge/Status-Demo--Ready-success.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)]()
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)]()
[![scikit--learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E.svg)]()

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Team |
| **Track** | AI |
| **Team Lead** | Khushal Vadher — 24it102@charusat.edu.in |
| **Members** | Darshan Raval (24it084@charusat.edu.in), Parth Patoliya (24it081@charusat.edu.in), Jay Rohit (24it085@charusat.edu.in) |

---

## 🎯 Problem Statement

Ports face severe bottleneck congestion due to uncoordinated vessel arrivals, draft constraints, and inefficient manual allocation of berths and cranes, resulting in prolonged vessel turnaround times, supply chain disruptions, and high demurrage costs. Port shift supervisors lack real-time predictive foresight to anticipate queue build-ups and automate resource-balanced operational schedules.

---

## 💡 Solution Overview

We built a modular, explainable AI and optimization decision-support platform that:
1. **Forecasts Terminal Congestion Levels**: Uses an explainable Random Forest machine learning classifier to predict congestion risks (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
2. **Computes Dynamic Alternate Routing**: Calculates multi-criteria composite route scores (congestion penalty, wait times, distance, capacity) to suggest optimal terminal diversions.
3. **Executes Priority-Aware Berth & Crane Optimization**: Implements non-overlapping greedy scheduling to allocate draft-compatible berths and 1–4 quay cranes per vessel.
4. **Generates a 72-Hour Master Operations Timeline**: Delivers an interactive operations control center dashboard providing shift supervisors with real-time visibility into planned vessel turnarounds.

---

## 🏗️ Architecture & Flow

```
React Frontend (Vite + Glassmorphism UI)
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

## ✨ Key Features

- **ML Congestion Forecasting:** Predicts terminal congestion levels (LOW, MEDIUM, HIGH, CRITICAL) and probabilities using explainable Random Forest modeling.
- **Dynamic Alternate Routing:** Calculates multi-factor composite route scores (congestion penalty, wait times, distance, capacity) to suggest optimal terminal diversions.
- **Automated Berth & Crane Optimization:** Priority-aware, non-overlapping greedy scheduling engine allocating draft-compatible berths and 1–4 quay cranes per vessel.
- **72-Hour Master Operations Timeline:** Interactive operations control center dashboard providing shift supervisors with real-time visibility into planned vessel turnarounds.
- **Explainable Operations Dashboard:** Built with React, Vite, and Recharts featuring dark-navy glassmorphism UI for clear command-center decision making.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, JavaScript (ES6+ / JSX) |
| **Frameworks** | FastAPI, React 18, Vite |
| **ML & Analytics** | scikit-learn (Random Forest), pandas, NumPy, joblib |
| **Databases** | SQLite (with relational seed migrations) |
| **Styling & Visualization** | Vanilla Glassmorphic CSS, Recharts, Lucide React, Leaflet |
| **Testing & Tooling** | pytest, httpx, Git |

---

## 📂 Repository Structure

```
├── src/                  # All source code
├── backend/
│   ├── api/             # FastAPI REST endpoints (/api/vessels, /api/congestion, /api/routes, /api/operations)
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
├── docs/                 # Written documentation & architecture specs
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts & sample input/output JSON
│   ├── screenshots/      # App screenshots
│   ├── demo-video-link.txt  # Link to demo video
│   └── live-demo-url.txt    # Live demo URL
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> See [`docs/setup-guide.md`](docs/setup-guide.md) for full setup instructions.

### 1. Backend Setup
```bash
# 1. Clone the repo
git clone https://github.com/khushalvadher0-hash/bob-ai-hackathon-Team.git
cd bob-ai-hackathon-Team

# 2. Install dependencies & train model
pip install -r backend/requirements.txt
python -m backend.ml.train_model

# 3. Configure environment
cp backend/.env.example backend/.env

# 4. Run the Backend API
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

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- **Simulated Port Telemetry:** The initial release uses synthetic vessel manifest and historical terminal congestion CSV datasets rather than live AIS telemetry streams.
- **Deterministic Routing Heuristic:** Uses rule-based weighted multi-criteria scoring rather than multi-commodity integer flow optimization.
- **Single Port Operations:** Scoped to Port Metro's 4 internal terminals and 11 berths; multi-port regional coordination is planned for subsequent iterations.

---

## 🏅 What We're Most Proud Of

We are most proud of building a fully integrated, modular decision-support system in record time that bridges explainable machine learning predictions with deterministic resource scheduling. Shift supervisors can immediately understand *why* a terminal is congested, review alternate routing suggestions, and inspect a conflict-free 72-hour operational timeline on a glassmorphic dashboard.

---

