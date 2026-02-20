from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import random

app = FastAPI()

# Enable CORS so frontend (React) can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for dev
    allow_methods=["*"],
    allow_headers=["*"],
)

# Example tourist data
# Format: { "tourist_id": {"lat": ..., "lng": ...} }
tourists: Dict[str, Dict[str, float]] = {
    "T001": {"lat": 19.071, "lng": 72.872},
    "T002": {"lat": 19.072, "lng": 72.873},
}

@app.get("/locations")
def get_locations():
    # OPTIONAL: simulate movement
    for t in tourists.values():
        t["lat"] += random.uniform(-0.0005, 0.0005)
        t["lng"] += random.uniform(-0.0005, 0.0005)
    return tourists
