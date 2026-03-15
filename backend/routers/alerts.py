from fastapi import APIRouter
from data.tourists import tourists
from services.geofence import check_geofence

router = APIRouter()

@router.get("/alerts")
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