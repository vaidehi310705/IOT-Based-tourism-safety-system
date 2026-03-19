from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import locations, alerts
from utils.file_watcher import start_watcher_thread  # import watcher

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(locations.router)
app.include_router(alerts.router)

# Start the automatic zone sync watcher
start_watcher_thread()