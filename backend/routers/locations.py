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
    tid = data.tourist_id
    if tid == "ME":
        mongo_id = "ME"
    else:
        mongo_id = f"REAL_{tid}"

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

# ---------------- INITIAL SYNC (🔥 FIX) ----------------
def initial_sync():
    try:
        import data.tourists as t_mod
        import data.zones as z_mod

        # --- TOURISTS ---
        for tid, loc in t_mod.tourists.items():
            tourists_col.update_one(
                {"tourist_id": tid},
                {"$set": loc},
                upsert=True
            )

        # --- ZONES ---
        for z in z_mod.zones:
            zones_col.update_one(
                {"name": z["name"]},
                {"$set": z},
                upsert=True
            )

        print("Initial sync done ✅")

    except Exception as e:
        print("Initial sync error:", e)


# ---------------- ZONE WATCHER ----------------
class ZoneFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("zones.py"):
            try:
                import importlib
                import data.zones as zones_mod
                importlib.reload(zones_mod)

                current = {z["name"]: z for z in zones_mod.zones}
                db = {z["name"]: z for z in zones_col.find()}

                # DELETE removed
                for name in db:
                    if name not in current:
                        zones_col.delete_one({"name": name})

                # UPSERT
                for name, z in current.items():
                    zones_col.update_one(
                        {"name": name},
                        {"$set": z},
                        upsert=True
                    )

                print("Zones synced ✅")

            except Exception as e:
                print("Zone sync error:", e)


# ---------------- TOURIST WATCHER ----------------
class TouristFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("tourists.py"):
            try:
                import importlib
                import data.tourists as t_mod
                importlib.reload(t_mod)

                current = t_mod.tourists
                db = {t["tourist_id"]: t for t in tourists_col.find()}

                # UPSERT
                for tid, loc in current.items():
                    tourists_col.update_one(
                        {"tourist_id": tid},
                        {"$set": loc},
                        upsert=True
                    )

                # DELETE ONLY demo
                for tid in db:
                    if tid != "ME" and not tid.startswith("REAL_") and tid not in current:
                        tourists_col.delete_one({"tourist_id": tid})

                print("Tourists synced ✅")

            except Exception as e:
                print("Tourist sync error:", e)


def start_watchers():
    path = os.path.join(os.path.dirname(__file__), "../data")

    observer = Observer()
    observer.schedule(ZoneFileHandler(), path, recursive=False)
    observer.schedule(TouristFileHandler(), path, recursive=False)
    observer.start()

    print("Watchers started ✅")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()


# ---------------- START EVERYTHING ----------------
initial_sync()  # 🔥 THIS FIXES YOUR ISSUE

threading.Thread(target=start_watchers, daemon=True).start()
