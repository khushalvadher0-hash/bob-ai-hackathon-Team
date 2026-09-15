# Setup & Installation Guide

> Follow these steps to run the complete Container Congestion Predictor & Port Operations Optimiser locally.

## Prerequisites

Before running the project, make sure you have the following installed:

- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

---

## Environment Configuration

Create a local environment file from the provided template:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default Value |
|---|---|---|
| `DATABASE_URL` | SQLite database connection string | `sqlite:///./database/port_operations.db` |
| `API_HOST` | FastAPI server host | `127.0.0.1` |
| `API_PORT` | FastAPI server port | `8000` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |

---

## Backend Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/khushalvadher0-hash/bob-ai-hackathon-Team.git
cd bob-ai-hackathon-Team

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Train the ML congestion prediction model
python -m backend.ml.train_model

# 4. Start the FastAPI API server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The Backend API will be active at `http://127.0.0.1:8000`  
Interactive OpenAPI/Swagger documentation is available at `http://127.0.0.1:8000/docs`

---

## Frontend Installation & Execution

In a second terminal window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

The Frontend Web Application will be running at `http://localhost:5173`

---

## Running Automated Tests

Run the full backend test suite to verify congestion prediction, routing scoring, and greedy scheduling:

```bash
python -m pytest backend/tests/ -v
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'pandas'` | Run `pip install -r backend/requirements.txt` |
| Port `8000` or `5173` in use | Terminate existing instances or specify `--port 8001` for backend |
| Model file `congestion_model.pkl` missing | Run `python -m backend.ml.train_model` to generate the serialized model artifact |
