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
        "name": "Tiger Point",
        "lat": 18.6959,
        "lng": 73.3950,
        "radius": 200,
        "risk": "RED",
        "type": "Cliff Risk"
    },

    {
        "name": "Lion Point",
        "lat": 18.6976,
        "lng": 73.3925,
        "radius": 300,
        "risk": "YELLOW",
        "type": "Crowd / Cliff"
    },

    {
        "name": "Bhushi Dam",
        "lat": 18.7362,
        "lng": 73.3940,
        "radius": 250,
        "risk": "RED",
        "type": "Water Risk"
    },

    {
        "name": "Rajmachi Fort",
        "lat": 18.8276,
        "lng": 73.3825,
        "radius": 500,
        "risk": "YELLOW",
        "type": "Trekking Risk"
    },

    {
        "name": "Karla Caves",
        "lat": 18.7828,
        "lng": 73.4710,
        "radius": 200,
        "risk": "YELLOW",
        "type": "Steep Access Zone"
    },

    {
        "name": "Dukes Nose",
        "lat": 18.7507,
        "lng": 73.3776,
        "radius": 250,
        "risk": "RED",
        "type": "Cliff / Trek Risk"
    },

    {
        "name": "Tigers Leap",
        "lat": 18.6948,
        "lng": 73.3967,
        "radius": 200,
        "risk": "RED",
        "type": "Cliff Edge"
    },

    {
        "name": "Lohagad Fort",
        "lat": 18.7108,
        "lng": 73.4786,
        "radius": 400,
        "risk": "YELLOW",
        "type": "Trekking Risk"
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

