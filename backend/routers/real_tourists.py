from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from database.mongo import tourists_col, locations_col
import uuid

router = APIRouter()

# -------------------------
# MODELS
# -------------------------

class TouristRegister(BaseModel):
    name: str

class LocationUpdate(BaseModel):
    device_id: str
    tourist_id: str = None  # ✅ optional, fixes 422
    lat: float
    lng: float

class DeviceStart(BaseModel):
    device_id: str

# -------------------------
# TOURIST SELF-REGISTERS
# -------------------------

@router.post("/register")
async def register_tourist(data: TouristRegister):

    # ✅ Use name as device_id so tourist can use same name to start tracking
    device_id = data.name.strip().lower().replace(" ", "_")

    existing = tourists_col.find_one({"device_id": device_id})

    if existing:
        # ✅ Already registered, just return OK instead of erroring
        return {
            "device_id": device_id,
            "status": "registered"
        }

    tourists_col.insert_one({
        "tourist_id": device_id,
        "name": data.name,
        "device_id": device_id,
        "lat": None,
        "lng": None,
        "created_at": datetime.utcnow()
    })

    locations_col.update_one(
        {"device_id": device_id},
        {
            "$setOnInsert": {
                "device_id": device_id,
                "lat": None,
                "lng": None,
                "updated_at": None
            }
        },
        upsert=True
    )

    return {
        "device_id": device_id,
        "status": "registered"
    }

# -------------------------
# TOURIST STARTS TRACKING
# -------------------------

@router.post("/start-tracking")
async def start_tracking(data: DeviceStart):

    tourist = tourists_col.find_one({"device_id": data.device_id})

    if not tourist:
        raise HTTPException(
            status_code=404,
            detail="Invalid device ID"
        )

    return {"message": "Tracking started successfully"}

# -------------------------
# TOURIST SENDS LOCATION
# -------------------------

@router.post("/update-location")  # ✅ fixed leading slash
async def update_location(data: LocationUpdate):

    device_id = data.device_id

    locations_col.update_one(
        {"device_id": device_id},
        {
            "$set": {
                "lat": data.lat,
                "lng": data.lng,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    tourists_col.update_one(
        {"device_id": device_id},
        {
            "$set": {
                "lat": data.lat,
                "lng": data.lng
            }
        }
    )

    return {"message": "Location updated successfully"}

# -------------------------
# ADMIN FETCHES LIVE LOCATIONS
# -------------------------

@router.get("/locations")
async def get_locations():

    tourists = list(tourists_col.find())

    result = {}

    for t in tourists:
        device_id = t.get("device_id")
        result[device_id] = {
            "name": t.get("name", "Demo Tourist"),
            "lat": t.get("lat"),
            "lng": t.get("lng")
        }

    return result