from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import locations, alerts
from data import auth
from utils.file_watcher import start_watcher_thread

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(locations.router, prefix="/api/locations", tags=["Locations"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])

start_watcher_thread()

@app.get("/")
def root():
    return {"message": "Tourist Safety System API is running ✅"}