# 🚀 Container Congestion Predictor & Port Operations Optimiser

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Team |
| **Track** | AI |
| **Team Lead** | Khushal Vadher — 24it102@charusat.edu.in |
| **Members** | Darshan Raval, Parth Patoliya, Jay Rohit |

---

## 🎯 Problem Statement

Ports face severe congestion due to inefficient manual allocation of berths and cranes, leading to delays, increased costs, and disrupted supply chains. Port operators lack real-time predictive insights to anticipate congestion and optimize resource utilization.

---

## 💡 Solution

We built a lightweight AI-driven system that analyzes vessel schedules and port capacity data to predict congestion levels and optimize resource allocation. The system provides berth and crane assignments, suggests alternate routing strategies, and generates a 72-hour operational plan to support faster and smarter port decision-making.

---

## ✨ Key Features

- **Congestion Prediction:** Predicts congestion level (High / Medium / Low) based on vessel inflow and port capacity
- **Berth Allocation:** Automated berth allocation based on arrival time and vessel priority
- **Crane Assignment:** Crane assignment based on vessel size for efficient cargo handling
- **Alternate Routing:** Routing recommendations during high congestion periods
- **72-Hour Planning:** Operational planning dashboard for port supervisors

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, JavaScript |
| **Frameworks** | FastAPI, React, Tailwind CSS |
| **IBM Technologies** | None |
| **Databases** | None |
| **Other** | Git, Postman, Vite |

---

## 📁 Repository Structure

```
├── src/                  # All source code
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> See [`docs/setup-guide.md`](docs/setup-guide.md) for full setup instructions.

```bash
# 1. Clone the repo
git clone https://github.com/khushalvadher0-hash/bob-ai-hackathon-Team.git
cd bob-ai-hackathon-Team

# 2. Install dependencies
pip install fastapi uvicorn

# 3. Configure environment
cp src/.env.example src/.env
# Edit .env with your values

# 4. Run the project
python src/main.py
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

- Uses simulated data and rule-based logic instead of real-time AIS data
- Advanced ML models not yet integrated due to time constraints
- Live tracking, weather integration, and dynamic optimization are planned for future versions

---

## 🏅 What We're Most Proud Of

We are most proud of delivering a complete working prototype within a short time that demonstrates real-world impact. The system combines simple yet effective decision logic with a clean and intuitive UI, making complex port operations easy to understand and act upon.

---
