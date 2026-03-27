from fastapi import APIRouter
from database.mongo import tourists_col
from services.geofence import check_geofence

router = APIRouter()

RISK_PRIORITY = {"RED": 1, "YELLOW": 2, "GREEN": 3}

@router.get("/alerts")
def get_alerts():
    result = {}
    # ✅ read from MongoDB, not local dict
    for tourist in tourists_col.find({}, {"_id": 0}):
        tid = tourist.get("tourist_id")
        lat = tourist.get("lat")
        lng = tourist.get("lng")
        if tid and lat is not None and lng is not None:
            result[tid] = check_geofence(lat, lng)
    return result

@router.get("/priority-tourists")
def get_priority_tourists():
    result = []
    # ✅ read from MongoDB, not local dict
    for tourist in tourists_col.find({}, {"_id": 0}):
        tid = tourist.get("tourist_id")
        lat = tourist.get("lat")
        lng = tourist.get("lng")
        if not tid or lat is None or lng is None:
            continue
        alerts = check_geofence(lat, lng)
        highest_risk = "GREEN"
        if alerts:
            risks = [a["risk"] for a in alerts]
            if "RED" in risks:
                highest_risk = "RED"
            elif "YELLOW" in risks:
                highest_risk = "YELLOW"
        result.append({
            "tourist_id": tid,
            "lat": lat,
            "lng": lng,
            "risk": highest_risk
        })
    result.sort(key=lambda x: RISK_PRIORITY[x["risk"]])
    return result