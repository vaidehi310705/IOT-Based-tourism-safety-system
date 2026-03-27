import os
import time
import importlib
from threading import Thread
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from database.mongo import zones_col, tourists_col
import data.zones as zones_file

# ✅ Always resolves correctly — points to backend/data/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # utils/
DATA_DIR = os.path.join(BASE_DIR, "../data")           # backend/data/

class ZoneFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("zones.py"):
            print("Detected zones.py change → syncing MongoDB...")
            importlib.reload(zones_file)   # ✅ reload to get latest zones
            sync_zones()

def sync_zones():
    zones_col.delete_many({})
    zones_col.insert_many(zones_file.zones)
    print(f"Synced {len(zones_file.zones)} zones from zones.py ✅")

def start_watching():
    event_handler = ZoneFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=DATA_DIR, recursive=False)  # ✅ fixed path
    observer.start()
    print("[ZONE WATCHER] Started watching zones.py for changes")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

def start_watcher_thread():
    Thread(target=start_watching, daemon=True).start()
