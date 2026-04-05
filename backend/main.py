from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import locations, alerts
from utils.file_watcher import start_watcher_thread  # import watcher
from routers import real_tourists

app = FastAPI()

# allow your frontend origin
origins = [
    
    "http://localhost:5173",
    "http://192.168.0.105:5173",  # if you access frontend from phone
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # safe for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(locations.router)
app.include_router(alerts.router)
app.include_router(real_tourists.router, prefix="/real-tourists")





# Start the automatic zone sync watcher
start_watcher_thread()