from fastapi import APIRouter
from data.tourists import tourists
from services.geofence import check_geofence 

router = APIRouter()


RISK_PRIORITY = {
    "RED": 1,
    "YELLOW": 2,
    "GREEN": 3
}

@router.get("/priority-tourists")
def get_priority_tourists():
    result = []

    for tourist_id, location in tourists.items():
        alerts = check_geofence(location["lat"], location["lng"])
        # Default priority
        highest_risk = "GREEN"

        if alerts:
            risks = [a["risk"] for a in alerts]

            if "RED" in risks:
                highest_risk = "RED"
            elif "YELLOW" in risks:
                highest_risk = "YELLOW"

        result.append({
            "tourist_id": tourist_id,
            "lat": location["lat"],
            "lng": location["lng"],
            "risk": highest_risk
        })

    # 🔥 SORT by priority
    result.sort(key=lambda x: RISK_PRIORITY[x["risk"]])

    return result

@router.get("/alerts")
def get_alerts():

    result = {}

    for tourist_id, location in tourists.items():

        alerts = check_geofence(location["lat"], location["lng"])

        result[tourist_id] = alerts

    return result