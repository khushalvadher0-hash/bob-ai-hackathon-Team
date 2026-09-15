import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api.vessel_routes import router as vessel_router
from .api.congestion_routes import router as congestion_router
from .api.routing_routes import router as routing_router
from .api.operations_routes import router as operations_router
from .services.prediction_service import get_dashboard_summary_data
from .database.database import check_connection, initialize_database

load_dotenv()

app = FastAPI(
    title="Container Congestion Predictor & Port Operations Optimiser",
    description="Intelligent MongoDB-backed system for port congestion forecasting, alternative routing, and 72-hour operational scheduling.",
    version="1.0.0"
)

# CORS Middleware setup
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
if "*" not in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(vessel_router)
app.include_router(congestion_router)
app.include_router(routing_router)
app.include_router(operations_router)

@app.on_event("startup")
def on_startup():
    """
    Lightweight MongoDB connection validation and collection initialization.
    Does not crash the server if Atlas is temporarily unreachable.
    """
    is_connected = check_connection()
    if is_connected:
        try:
            initialize_database()
        except Exception as e:
            print(f"MongoDB collection initialization note: {e}")

@app.get("/")
def read_root():
    return {
        "message": "Container Congestion Predictor & Port Operations Optimiser API",
        "database": "MongoDB Atlas",
        "status": "running"
    }

@app.get("/health")
def health_check():
    db_ok = check_connection()
    return {
        "status": "healthy",
        "database": "connected" if db_ok else "unreachable"
    }

@app.get("/dashboard-summary")
@app.get("/api/dashboard-summary")
def get_dashboard_summary():
    """
    Returns aggregated port operations dashboard summary:
    - total_vessels
    - high_risk_vessels
    - congested_terminals
    - available_berths
    - active_cranes
    - congestion_probability
    - expected_delay
    - vessel_distribution: { scheduled, queued, approaching }
    """
    return get_dashboard_summary_data()

