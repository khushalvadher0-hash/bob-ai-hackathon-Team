import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api.vessel_routes import router as vessel_router
from .api.congestion_routes import router as congestion_router
from .api.routing_routes import router as routing_router
from .api.operations_routes import router as operations_router
from .database.database import init_db

load_dotenv()

app = FastAPI(
    title="Container Congestion Predictor & Port Operations Optimiser",
    description="Intelligent system for port congestion forecasting, alternative routing, and 72-hour operational scheduling.",
    version="1.0.0"
)

# CORS Middleware setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

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
    # Initialize DB with seed data if needed
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization notice: {e}")

@app.get("/")
def read_root():
    return {
        "message": "Container Congestion Predictor & Port Operations Optimiser API",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
