# backend/data/zones.py
zones = [
    {"name": "home 1", "lat": 19.345621, "lng": 72.804927, "radius": 100, "risk": "RED"},
    {"name": "home 2", "lat": 19.347880, "lng": 72.804212, "radius": 150, "risk": "YELLOW"},
    {"name": "VCET College", "lat": 19.383897, "lng": 72.828502, "radius": 400, "risk": "YELLOW"},
    {"name": "Lonavala Lake", "lat": 18.7600, "lng": 73.4200, "radius": 400, "risk": "YELLOW"},
    {"name": "Bhushi Dam", "lat": 18.7585, "lng": 73.4080, "radius": 400, "risk": "YELLOW"},
    {"name": "Lion's Point", "lat": 18.7555, "lng": 73.4015, "radius": 400, "risk": "YELLOW"},
    {"name": "Tiger's Leap", "lat": 18.7540, "lng": 73.4000, "radius": 400, "risk": "YELLOW"},
    {"name": "Tiger Point", "lat": 18.6959, "lng": 73.3950, "radius": 200, "risk": "RED"},
    {"name": "Lion Point", "lat": 18.6976, "lng": 73.3925, "radius": 300, "risk": "YELLOW"},
    {"name": "Rajmachi Fort", "lat": 18.8276, "lng": 73.3825, "radius": 500, "risk": "YELLOW"},
    {"name": "Karla Caves", "lat": 18.7828, "lng": 73.4710, "radius": 200, "risk": "YELLOW"},
    {"name": "Dukes Nose", "lat": 18.7507, "lng": 73.3776, "radius": 250, "risk": "RED"},
    {"name": "Lohagad Fort", "lat": 18.7108, "lng": 73.4786, "radius": 400, "risk": "YELLOW"},
]

# Insert zones only if collection is empty
from database.mongo import zones_col

if zones_col.count_documents({}) == 0:
    zones_col.insert_many(zones)
    print("Zones inserted into MongoDB ✅")