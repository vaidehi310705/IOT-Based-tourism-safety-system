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
    lat: float
    lng: float


class DeviceStart(BaseModel):
    device_id: str


# -------------------------
# ADMIN REGISTERS TOURIST
# -------------------------

@router.post("/register")
async def register_tourist(data: TouristRegister):

    device_id = "T" + uuid.uuid4().hex[:8]

    existing = tourists_col.find_one({"device_id": device_id})

    if existing:
        raise HTTPException(
            status_code=500,
            detail="Device ID collision detected. Retry."
        )

    tourists_col.insert_one({
        "tourist_id": device_id,
        "name": data.name,
        "device_id": device_id,
        "lat": None,
        "lng": None,
        "created_at": datetime.utcnow()
    })

    # create tracking entry
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

    tourist = tourists_col.find_one({
        "device_id": data.device_id
    })

    if not tourist:
        raise HTTPException(
            status_code=404,
            detail="Invalid device ID"
        )

    return {
        "message": "Tracking started successfully"
    }


# -------------------------
# TOURIST SENDS LOCATION
# -------------------------

@router.post("/update-location")
async def update_location(data: LocationUpdate):

    # update locations collection
    locations_col.update_one(
        {"device_id": data.device_id},
        {
            "$set": {
                "lat": data.lat,
                "lng": data.lng,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    # update tourists collection also
    tourists_col.update_one(
        {"device_id": data.device_id},
        {
            "$set": {
                "lat": data.lat,
                "lng": data.lng
            }
        }
    )

    return {
        "message": "Location updated successfully"
    }


# -------------------------
# ADMIN FETCHES LIVE LOCATIONS
# (THIS FIXES YOUR ISSUE)
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