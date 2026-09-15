"""
Root helper script to seed MongoDB database.
Run: python seed_database.py
"""
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from backend.seed_data import seed

if __name__ == "__main__":
    seed()
