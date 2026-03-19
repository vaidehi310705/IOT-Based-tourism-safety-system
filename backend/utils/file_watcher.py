import time
from threading import Thread
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from database.mongo import zones_col, tourists_col
from data import zones as zones_file  # zones.py

class ZoneFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("zones.py"):
            print("Detected zones.py change → syncing MongoDB...")
            sync_zones()

def sync_zones():
    # Remove old zones
    zones_col.delete_many({})
    # Insert current zones from zones.py
    zones_col.insert_many(zones_file.zones)
    print(f"Synced {len(zones_file.zones)} zones from zones.py ✅")

def start_watching():
    event_handler = ZoneFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path="backend/data", recursive=False)
    observer.start()
    print("Started watching zones.py for changes...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# Run watcher in background thread (so FastAPI keeps running)
def start_watcher_thread():
    Thread(target=start_watching, daemon=True).start()