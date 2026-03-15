from pydantic import BaseModel

class LocationUpdate(BaseModel):
    tourist_id: str
    lat: float
    lng: float