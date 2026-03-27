from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo import tourists_col
from datetime import datetime

router = APIRouter()

class TouristRegister(BaseModel):
    name: str
    phone: str
    emergency_contact: str
    destination: str

@router.post("/register")
def register_tourist(tourist: TouristRegister):
    count = tourists_col.count_documents({})
    tourist_id = f"T{101 + count}"

    tourist_doc = {
        "tourist_id": tourist_id,        # ✅ matches locations.py field name
        "name": tourist.name,
        "phone": tourist.phone,
        "emergency_contact": tourist.emergency_contact,
        "destination": tourist.destination,
        "lat": None,
        "lng": None,
        "status": "active",
        "registered_at": datetime.utcnow().isoformat()
    }

    tourists_col.insert_one(tourist_doc)

    return {
        "success": True,
        "tourist_id": tourist_id,
        "message": f"Tourist {tourist.name} registered successfully ✅"
    }

@router.get("/tourists")
def get_all_tourists():
    tourists = list(tourists_col.find({}, {"_id": 0}))
    return {"tourists": tourists}

@router.get("/tourists/{tourist_id}")
def get_tourist(tourist_id: str):
    tourist = tourists_col.find_one({"tourist_id": tourist_id}, {"_id": 0})
    if not tourist:
        return {"error": "Tourist not found"}
    return tourists