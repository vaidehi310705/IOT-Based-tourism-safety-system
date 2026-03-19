from fastapi import APIRouter
from database.mongo import tourists_col, zones_col
from services.geofence import calculate_distance

router = APIRouter()

@router.get("/alerts")
def get_alerts():

    results = {}

    tourists = list(tourists_col.find())
    zones = list(zones_col.find())

    for t in tourists:

        t_id = t["tourist_id"]
        t_lat = t["lat"]
        t_lng = t["lng"]

        alerts = []

        for z in zones:

            distance = calculate_distance(
                t_lat, t_lng,
                z["lat"], z["lng"]
            )

            if distance <= z.get("radius", 100):
                alerts.append({
                    "zone": z.get("name", ""),
                    "risk": z.get("risk", "GREEN")
                })

        if alerts:
            results[t_id] = alerts

    return results