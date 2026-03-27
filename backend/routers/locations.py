from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo import tourists_col, zones_col

router = APIRouter()

class LocationUpdate(BaseModel):
    tourist_id: str
    lat: float
    lng: float

@router.post("/update_location")
def update_location(data: LocationUpdate):
    tourists_col.update_one(
        {"tourist_id": data.tourist_id},
        {"$set": {"lat": data.lat, "lng": data.lng}},
        upsert=True
    )
    return {"status": "success", "updated_id": data.tourist_id}

@router.get("/locations")
def get_locations():
    live_tourists = {}
    for t in tourists_col.find():
        tid = t.get("tourist_id")
        if tid and "lat" in t and "lng" in t:
            live_tourists[tid] = {
                "lat": t["lat"],
                "lng": t["lng"],
                "name": t.get("name", "Unknown"),
                "status": t.get("status", "active"),
                "destination": t.get("destination", "")
            }
    return live_tourists

@router.get("/zones")
def get_zones():
    return [
        {
            "name": z.get("name", ""),
            "lat": z["lat"],
            "lng": z["lng"],
            "radius": z.get("radius", 100),
            "risk": z.get("risk", "GREEN")
        }
        for z in zones_col.find()
    ]

@router.delete("/tourists/{tourist_id}")
def delete_tourist(tourist_id: str):
    result = tourists_col.delete_one({"tourist_id": tourist_id})
    if result.deleted_count == 0:
        return {"status": "fail", "message": "Tourist not found"}
    return {"status": "success", "deleted_id": tourist_id}

@router.delete("/zones/{zone_name}")
def delete_zone(zone_name: str):
    result = zones_col.delete_one({"name": zone_name})
    if result.deleted_count == 0:
        return {"status": "fail", "message": "Zone not found"}
    return {"status": "success", "deleted_name": zone_name}