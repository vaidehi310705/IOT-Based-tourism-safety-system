from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers import locations, alerts
from utils.file_watcher import start_watcher_thread
from routers import real_tourists

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://192.168.0.105:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(locations.router)
app.include_router(alerts.router)
app.include_router(real_tourists.router, prefix="/real-tourists")

# Start the automatic zone sync watcher
start_watcher_thread()

# ✅ Serve React frontend — must be LAST
app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    response = FileResponse("../frontend/dist/index.html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response