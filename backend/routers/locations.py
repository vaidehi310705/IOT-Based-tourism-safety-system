from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo import tourists_col, zones_col
from data import zones as zones_file
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
import time
import os

router = APIRouter()

# --- POST payload ---
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

# --- Get all tourists including demo users ---
@router.get("/locations")
def get_locations():
    demo_users = {
        "T1": {"lat": 19.345621, "lng": 72.804927},
        "T2": {"lat": 19.383897, "lng": 72.828502},
    }

    # Insert demo users into MongoDB if not already present
    for tid, loc in demo_users.items():
        tourists_col.update_one(
            {"tourist_id": tid},
            {"$setOnInsert": {"lat": loc["lat"], "lng": loc["lng"]}},
            upsert=True
        )

    # Merge live tourists from MongoDB
    live_tourists = {
        t["tourist_id"]: {"lat": t["lat"], "lng": t["lng"]}
        for t in tourists_col.find()
        if "lat" in t and "lng" in t
    }

    return live_tourists

# --- Get all zones ---
@router.get("/zones")
def get_zones():
    zones = zones_col.find()
    return [
        {
            "name": z.get("name", ""),
            "lat": z["lat"],
            "lng": z["lng"],
            "radius": z.get("radius", 100),
            "risk": z.get("risk", "GREEN")
        }
        for z in zones
    ]

# --- Delete a tourist ---
@router.delete("/tourists/{tourist_id}")
def delete_tourist(tourist_id: str):
    result = tourists_col.delete_one({"tourist_id": tourist_id})
    if result.deleted_count == 0:
        return {"status": "fail", "message": "Tourist not found"}
    return {"status": "success", "deleted_id": tourist_id}

# --- Delete a zone ---
@router.delete("/zones/{zone_name}")
def delete_zone(zone_name: str):
    result = zones_col.delete_one({"name": zone_name})
    if result.deleted_count == 0:
        return {"status": "fail", "message": "Zone not found"}
    return {"status": "success", "deleted_name": zone_name}

# --- Auto-sync zones using watchdog ---
class ZoneFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith("zones.py"):
            try:
                import importlib
                import data.zones as zones_mod
                importlib.reload(zones_mod)

                current_zones = {z["name"] for z in zones_mod.zones}
                db_zones = {z["name"] for z in zones_col.find({}, {"name": 1})}

                # Delete removed zones
                for z in db_zones - current_zones:
                    zones_col.delete_one({"name": z})

                # Add new zones
                for z in zones_mod.zones:
                    if z["name"] not in db_zones:
                        zones_col.insert_one(z)

                print("[AUTO-SYNC] Zones updated automatically ✅")
            except Exception as e:
                print("Error auto-syncing zones:", e)

def start_zone_watcher():
    path_to_watch = os.path.join(os.path.dirname(__file__), "../data")
    event_handler = ZoneFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=path_to_watch, recursive=False)
    observer.start()
    print("[ZONE WATCHER] Started watching zones.py for changes")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# --- Auto-sync tourists using watchdog ---
# --- Auto-sync tourists using watchdog ---
class TouristFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith("tourists.py"):
            try:
                import importlib
                import data.tourists as tourists_mod
                importlib.reload(tourists_mod)

                current_tourists = getattr(tourists_mod, "tourists", {})
                db_tourist_docs = {t["tourist_id"]: t for t in tourists_col.find()}

                # Insert new or update existing tourists
                for tid, loc in current_tourists.items():
                    if tid in db_tourist_docs:
                        # Update if lat/lng changed
                        if (db_tourist_docs[tid]["lat"] != loc["lat"] or
                            db_tourist_docs[tid]["lng"] != loc["lng"]):
                            tourists_col.update_one(
                                {"tourist_id": tid},
                                {"$set": {"lat": loc["lat"], "lng": loc["lng"]}}
                            )
                    else:
                        # Insert new tourist
                        tourists_col.insert_one(
                            {"tourist_id": tid, "lat": loc["lat"], "lng": loc["lng"]}
                        )

                # Delete removed tourists
                removed_ids = set(db_tourist_docs.keys()) - set(current_tourists.keys())
                for rid in removed_ids:
                    tourists_col.delete_one({"tourist_id": rid})

                print("[AUTO-SYNC] Tourists updated automatically ✅")
            except Exception as e:
                print("Error auto-syncing tourists:", e)

def start_tourist_watcher():
    path_to_watch = os.path.join(os.path.dirname(__file__), "../data")
    event_handler = TouristFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=path_to_watch, recursive=False)
    observer.start()
    print("[TOURIST WATCHER] Started watching tourists.py for changes")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# Run watchers in background threads
threading.Thread(target=start_zone_watcher, daemon=True).start()
threading.Thread(target=start_tourist_watcher, daemon=True).start()