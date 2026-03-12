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

# Danger zones dataset
zones = [
    {
        "name": "Cliff Zone",
        "lat": 19.0715,
        "lng": 72.8725,
        "radius": 200,
        "risk": "RED"
    },
    {
        "name": "Water Zone",
        "lat": 19.0725,
        "lng": 72.8735,
        "radius": 300,
        "risk": "YELLOW"
    }
]

# Haversine formula
from math import radians, sin, cos, sqrt, atan2

def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c

def check_geofence(lat, lng):

    alerts = []

    for zone in zones:

        distance = calculate_distance(
            lat, lng,
            zone["lat"], zone["lng"]
        )

        if distance <= zone["radius"]:

            alerts.append({
                "zone": zone["name"],
                "risk": zone["risk"]
            })

    return alerts

@app.get("/alerts")
def get_alerts():

    results = {}

    for tourist_id, location in tourists.items():

        alerts = check_geofence(
            location["lat"],
            location["lng"]
        )

        if alerts:
            results[tourist_id] = alerts

    return results

