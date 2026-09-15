# Solution Overview

## What We Built

We built the **Container Congestion Predictor & Port Operations Optimiser**, a lightweight, explainable AI and operations optimization system designed for port shift supervisors. The system anticipates terminal congestion before vessels arrive, calculates intelligent alternate routing recommendations, and produces an automated 72-hour operational plan with non-overlapping berth assignments and crane allocations.

## How It Works

1. **Data Ingestion & State Monitoring:** Ingests vessel manifests (`vessels.csv`), terminal berth availability (`berths.csv`), and port infrastructure capacity (`ports.csv`).
2. **Machine Learning Congestion Forecast:** Evaluates terminal utilization and container-to-crane ratios with an explainable Random Forest classifier to predict congestion levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and probabilities.
3. **Multi-Criteria Alternate Routing:** For vessels scheduled to arrive at congested terminals, evaluates alternate berths using a composite score balancing congestion risk, wait times, navigation distance, and remaining capacity.
4. **Greedy Priority-Aware Scheduling:** Assigns eligible draft-compatible berths and optimal crane counts (1 to 4 cranes per vessel) based on container volume and priority, calculating non-overlapping arrival-to-departure time slots.
5. **72-Hour Operations Dashboard:** Renders interactive command-center analytics, hotspot indicators, reroute recommendations, and an operational turnaround timeline.

## Architecture Flow

```
[Vessel Manifests & Quay Data]
              │
              ▼
    [FastAPI REST API Layer]
              │
    ┌─────────┼─────────────────────┐
    │         │                     │
    ▼         ▼                     ▼
[ML Model] [Routing Engine] [Berth & Crane Optimizer]
(RF Classifier) (Composite Scoring) (Greedy Scheduler)
    │         │                     │
    └─────────┼─────────────────────┘
              ▼
   [72-Hour Operations Plan]
              │
              ▼
   [React Web Dashboard]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Explainable Random Forest Model** | Enables shift supervisors to clearly understand feature contributions without complex deep learning black boxes. |
| **Priority-Aware Greedy Scheduler** | Guarantees non-overlapping berth occupancy and immediate deterministic turnaround times suitable for real-time hackathon execution. |
| **Decoupled 4-Tier Architecture** | Clean separation of API, Services, Analytics, and Frontend ensures 4 students can work independently on separate Git branches. |
| **Dark Navy Glassmorphic UI** | High-contrast command-center theme designed for operations rooms and demo readability. |
