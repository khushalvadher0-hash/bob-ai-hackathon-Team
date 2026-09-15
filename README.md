# 🚀 Container Congestion Predictor & Port Operations Optimiser

> Intelligent port congestion forecasting, alternative berth routing, and 72-hour operational planning platform.

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

## 💡 Solution

We built a modular, explainable AI and optimization decision-support platform that forecasts terminal congestion levels via a Random Forest machine learning classifier, computes dynamic multi-criteria rerouting recommendations for incoming vessels, and executes priority-aware greedy scheduling to generate non-overlapping berth and crane assignments over a rolling 72-hour operational planning horizon.

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
├── docs/                # Architecture, API, ML & optimization specs
└── demo/                # Sample input and output JSON artifacts
```

---

## 🚀 Getting Started

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

# 5. Run the Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

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
