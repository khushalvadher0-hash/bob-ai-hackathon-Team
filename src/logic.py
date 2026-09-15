def predict_congestion(ships, capacity):
    if ships > capacity:
        return "HIGH"
    return "LOW"