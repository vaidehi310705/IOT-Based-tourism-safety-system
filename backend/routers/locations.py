from fastapi import APIRouter
from pydantic import BaseModel
from database.mongo import tourists_col, zones_col
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
import time
import os

router = APIRouter()

# ================= GET LOCATIONS =================

@router.get("/locations")
def get_locations():
    output = {}
    for tourist in tourists_col.find():
        if tourist.get("lat") and tourist.get("lng"):
            tid = tourist.get("device_id") or tourist.get("tourist_id")
            output[tid] = {
                "lat": tourist["lat"],
                "lng": tourist["lng"]
            }
    return output

# ================= GET ZONES =================

@router.get("/zones")
def get_zones():
    return list(zones_col.find({}, {"_id": 0}))

# ================= INITIAL DEMO DATA SYNC =================

def initial_sync():
    try:
        import data.tourists as tourists_mod
        import data.zones as zones_mod

        print("Syncing demo tourists...")
        for tid, loc in tourists_mod.tourists.items():
            tourists_col.update_one(
                {"tourist_id": tid},
                {
                    "$set": {
                        "tourist_id": tid,
                        "device_id": tid,
                        "name": loc.get("name", "Demo Tourist"),
                        "lat": loc["lat"],
                        "lng": loc["lng"]
                    }
                },
                upsert=True
            )
        print("Demo tourists synced")

        print("Syncing zones...")
        for zone in zones_mod.zones:
            zones_col.update_one(
                {"name": zone["name"]},
                {"$set": zone},
                upsert=True
            )
        print("Zones synced")

    except Exception as e:
        print("Initial sync error:", e)

# ================= FILE WATCHERS =================

class ZoneWatcher(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("zones.py"):
            try:
                import importlib
                import data.zones as zones_mod
                importlib.reload(zones_mod)
                for zone in zones_mod.zones:
                    zones_col.update_one(
                        {"name": zone["name"]},
                        {"$set": zone},
                        upsert=True
                    )
                print("Zones auto-updated")
            except Exception as e:
                print("Zone watcher error:", e)

class TouristWatcher(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("tourists.py"):
            try:
                import importlib
                import data.tourists as tourists_mod
                importlib.reload(tourists_mod)
                for tid, loc in tourists_mod.tourists.items():
                    tourists_col.update_one(
                        {"tourist_id": tid},
                        {
                            "$set": {
                                "tourist_id": tid,
                                "device_id": tid,
                                "name": loc.get("name", "Demo Tourist"),
                                "lat": loc["lat"],
                                "lng": loc["lng"]
                            }
                        },
                        upsert=True
                    )
                print("Tourists auto-updated")
            except Exception as e:
                print("Tourist watcher error:", e)

# ================= START WATCHERS =================

def start_watchers():
    path = os.path.join(os.path.dirname(__file__), "../data")
    observer = Observer()
    observer.schedule(ZoneWatcher(), path, recursive=False)
    observer.schedule(TouristWatcher(), path, recursive=False)
    observer.start()
    print("Watchers running")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# ================= START BACKGROUND SERVICES =================

initial_sync()

threading.Thread(
    target=start_watchers,
    daemon=True
).start()