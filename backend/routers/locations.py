from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo import tourists_col, zones_col

router = APIRouter()

# POST payload
class LocationUpdate(BaseModel):
    tourist_id: str
    lat: float
    lng: float

# --- Update or insert tourist location ---
@router.post("/update_location")
def update_location(data: LocationUpdate):
    tourists_col.update_one(
        {"tourist_id": data.tourist_id},
        {"$set": {"lat": data.lat, "lng": data.lng}},
        upsert=True
    )
    return {"status": "success", "updated_id": data.tourist_id}

# --- Get all tourists ---
@router.get("/locations")
def get_locations():
    tourists = tourists_col.find()
    return {
        t["tourist_id"]: {"lat": t["lat"], "lng": t["lng"]}
        for t in tourists if "lat" in t and "lng" in t
    }

# --- Get all zones ---
@router.get("/zones")
def get_zones():
    zones = zones_col.find()
    return [
        {
            "name": z.get("name", ""),
            "lat": z["lat"],
            "lng": z["lng"],
            "radius": z.get("radius", 100),  # default 100m
            "risk": z.get("risk", "GREEN")   # default GREEN
        }
        for z in zones
    ]