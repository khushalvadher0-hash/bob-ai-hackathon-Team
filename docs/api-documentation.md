# API Documentation

Base URL: `http://127.0.0.1:8000`

### 1. System Health
- **`GET /`**
  - Response:
    ```json
    {
      "message": "Container Congestion Predictor & Port Operations Optimiser API",
      "status": "running"
    }
    ```
- **`GET /health`**
  - Response:
    ```json
    { "status": "healthy" }
    ```

---

### 2. Vessel Fleet Endpoints
- **`GET /api/vessels`**
  - Returns array of all active and scheduled vessels.
- **`GET /api/vessels/{vessel_id}`**
  - Returns detailed status and risk level for a single vessel.

---

### 3. Congestion Prediction Endpoints
- **`GET /api/congestion`**
  - Returns congestion status, predicted wait times, and probabilities for all port terminals.
- **`GET /api/congestion/{terminal_id}`**
  - Returns specific terminal congestion evaluation.

---

### 4. Dynamic Alternate Routing
- **`GET /api/routes/{vessel_id}`**
  - Computes multi-attribute routing recommendation comparing current terminal with alternative berths.

---

### 5. 72-Hour Operations & Resource Allocation
- **`GET /api/operations/72h`**
  - Returns the complete 72-hour operational plan with scheduled non-overlapping berth time slots and crane allocations.
- **`GET /api/operations/berths`**
  - Lists all berths, status, capacity, and crane configurations.
- **`GET /api/operations/cranes`**
  - Lists deployable crane assets across the port.
