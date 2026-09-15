# System Architecture

## Overview
The **Container Congestion Predictor & Port Operations Optimiser** is an end-to-end intelligent decision support system designed to assist port shift supervisors in anticipating bottlenecks, re-routing vessels dynamically, and optimizing berth and crane allocations over a rolling 72-hour planning horizon.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                           │
│     [Dashboard]   [Vessels]   [Congestion]   [Routing]   [Operations]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (Axios)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FastAPI Gateway                               │
│     /api/vessels      /api/congestion      /api/routes      /api/operations │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                 │
│  [vessel_service]   [congestion_service]   [routing_service]   [operations_service] │
└───────────┬───────────────────────┼─────────────────────────┬──────────┘
            │                       │                         │
            ▼                       ▼                         ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
│     ML Module       │  │   Routing Engine    │  │ Optimization Module  │
│ (Random Forest / RF)│  │ (Multi-criteria     │  │ (Greedy Berth &      │
│ Congestion Pred.    │  │  Route Scoring)     │  │  Crane Allocator)    │
└───────────┬─────────┘  └──────────┬──────────┘  └──────────┬───────────┘
            │                       │                        │
            └───────────────────────┼────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       72-Hour Operations Planner                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Data & SQLite Storage                          │
│     [vessels.csv]       [berths.csv]       [historical_congestion.csv] │
└────────────────────────────────────────────────────────────────────────┘
```

## Architectural Layers
1. **Frontend**: Modern SPA built with React, Vite, and Lucide icons providing real-time visibility into port state, congestion maps, and scheduling timelines.
2. **API Layer**: Lightweight FastAPI REST application offering structured endpoints with strict Pydantic schemas and CORS support.
3. **Service Layer**: Decouples endpoints from business logic, aggregating data from CSV/SQLite and dispatching to analytical engines.
4. **ML Module**: Explainable Random Forest model predicting terminal congestion probability based on incoming vessel volumes and resource availability.
5. **Routing Engine**: Heuristic multi-criteria optimization evaluating alternate terminals to alleviate queue bottlenecks.
6. **Optimization & Planning**: Greedy non-overlapping scheduling engine generating 72-hour operational timelines with optimal crane counts.
