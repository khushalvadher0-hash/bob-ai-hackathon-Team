import pytest
from ..ml.predict import predict_congestion
from ..services.congestion_service import get_terminal_congestion_status

def test_predict_congestion_low():
    features = {
        "vessel_count": 1,
        "container_count": 1000,
        "available_berths": 3,
        "available_cranes": 6
    }
    result = predict_congestion(features)
    assert "level" in result
    assert "probability" in result
    assert result["level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

def test_predict_congestion_high():
    features = {
        "vessel_count": 6,
        "container_count": 12000,
        "available_berths": 0,
        "available_cranes": 1
    }
    result = predict_congestion(features)
    assert result["level"] in ["HIGH", "CRITICAL"]
    assert result["probability"] > 0.5

def test_congestion_service_structure():
    status = get_terminal_congestion_status()
    assert isinstance(status, list)
    assert len(status) == 4
    assert status[0]["terminal_id"] in ["T1", "T2", "T3", "T4"]
