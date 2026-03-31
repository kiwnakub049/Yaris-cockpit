#!/usr/bin/env python3
"""
Yaris Cockpit Demo Backend
Mock data for development and testing without hardware
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import random
import json
import time
from datetime import datetime
from pathlib import Path

app = FastAPI(title="Yaris Cockpit Demo", version="2.0")

# Enable CORS for web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],  # Vite dev server + Android
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files if dist exists (production mode)
static_path = Path(__file__).parent.parent / "web_ui" / "dist"
if static_path.exists():
    app.mount("/assets", StaticFiles(directory=static_path / "assets"), name="assets")

class DemoDataGenerator:
    def __init__(self):
        self.rpm = 800
        self.speed = 0
        self.coolant_temp = 85
        self.fuel_level = 75
        self.gear = 1
        self.lat = 13.7563  # Bangkok coordinates
        self.lon = 100.5018
        self.gps_speed = 0

    def update_sensors(self):
        """Simulate realistic sensor data changes"""
        # RPM simulation (idle to redline)
        if random.random() < 0.1:  # 10% chance to change RPM
            self.rpm = random.randint(800, 6500)

        # Speed based on RPM (simplified)
        self.speed = int(self.rpm / 35)  # Rough approximation

        # Coolant temp (normal range)
        self.coolant_temp = random.randint(80, 110)

        # Fuel level (gradually decrease)
        if random.random() < 0.05:  # 5% chance to decrease fuel
            self.fuel_level = max(10, self.fuel_level - random.randint(1, 5))

        # Gear calculation
        if self.speed < 20:
            self.gear = 1
        elif self.speed < 40:
            self.gear = 2
        elif self.speed < 60:
            self.gear = 3
        elif self.speed < 80:
            self.gear = 4
        else:
            self.gear = 5

    def update_gps(self):
        """Simulate GPS movement"""
        # Small random movement
        self.lat += random.uniform(-0.001, 0.001)
        self.lon += random.uniform(-0.001, 0.001)
        self.gps_speed = self.speed  # GPS speed matches vehicle speed

demo_gen = DemoDataGenerator()

# WebSocket connections
active_connections = []

@app.get("/")
async def root():
    return {"message": "Yaris Cockpit Demo Backend", "status": "running", "mode": "demo"}

@app.get("/api/sensors")
async def get_sensors():
    demo_gen.update_sensors()
    return {
        "timestamp": datetime.now().isoformat(),
        "rpm": demo_gen.rpm,
        "speed": demo_gen.speed,
        "coolant_temp": demo_gen.coolant_temp,
        "fuel_level": demo_gen.fuel_level,
        "gear": demo_gen.gear,
        "engine_load": random.randint(20, 90),
        "throttle_position": random.randint(10, 100),
        "intake_temp": random.randint(20, 50),
        "maf": random.randint(5, 25)
    }

@app.get("/api/gps")
async def get_gps():
    demo_gen.update_gps()
    return {
        "timestamp": datetime.now().isoformat(),
        "lat": demo_gen.lat,
        "lon": demo_gen.lon,
        "speed": demo_gen.gps_speed,
        "altitude": random.randint(0, 100),
        "satellites": random.randint(5, 12),
        "accuracy": random.uniform(1.0, 5.0)
    }

@app.get("/api/bluetooth/status")
async def get_bluetooth_status():
    return {
        "connected": False,
        "device": None,
        "track": None,
        "artist": None,
        "album": None
    }

@app.get("/api/carplay/status")
async def get_carplay_status():
    return {
        "connected": False,
        "device": None
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            # Send demo data every second
            demo_gen.update_sensors()
            demo_gen.update_gps()

            data = {
                "sensors": {
                    "timestamp": datetime.now().isoformat(),
                    "rpm": demo_gen.rpm,
                    "speed": demo_gen.speed,
                    "coolant_temp": demo_gen.coolant_temp,
                    "fuel_level": demo_gen.fuel_level,
                    "gear": demo_gen.gear
                },
                "gps": {
                    "lat": demo_gen.lat,
                    "lon": demo_gen.lon,
                    "speed": demo_gen.gps_speed
                }
            }

            await websocket.send_json(data)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        active_connections.remove(websocket)

# Serve index.html for production
@app.get("/{path:path}")
async def serve_frontend(path: str):
    if static_path.exists():
        index_path = static_path / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
    return {"error": "Frontend not built", "path": path}

if __name__ == "__main__":
    print("🚗 Yaris Cockpit Demo Backend")
    print("📊 Mock data mode - no hardware required")
    print("🌐 WebSocket: ws://0.0.0.0:8000/ws (or localhost:8000)")
    print("🔗 API: http://0.0.0.0:8000/api/* (or localhost:8000)")
    print("🎨 Frontend: http://localhost:3000 (dev) or http://0.0.0.0:8000 (prod)")
    print("📱 For Android: Use http://localhost:3000 or http://[device-ip]:3000")
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.websocket("/ws/sensors")
async def websocket_sensors(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            demo_gen.update_sensors()
            data = {
                "timestamp": datetime.now().isoformat(),
                "rpm": demo_gen.rpm,
                "speed": demo_gen.speed,
                "coolant_temp": demo_gen.coolant_temp,
                "fuel_level": demo_gen.fuel_level,
                "gear": demo_gen.gear
            }
            await websocket.send_json(data)
            await asyncio.sleep(0.1)  # Update every 100ms
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.websocket("/ws/racing")
async def websocket_racing(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            demo_gen.update_sensors()
            data = {
                "timestamp": int(time.time() * 1000),
                "rpm": demo_gen.rpm,
                "speed": demo_gen.speed,
                "throttle": random.randint(10, 100),
                "coolant_temp": demo_gen.coolant_temp,
                "atf_temp": random.randint(80, 120),
                "engine_load": random.randint(20, 90),
                "intake_temp": random.randint(20, 50),
                "fuel_level": demo_gen.fuel_level,
                "ambient_temp": random.randint(25, 35),
                "gear": str(demo_gen.gear),
                "gear_confidence": random.uniform(0.8, 1.0),
                "shift_recommendation": None,
                "is_shift_light": demo_gen.rpm > 6000,
                "is_overheating": demo_gen.coolant_temp > 105,
                "is_atf_warning": random.random() < 0.1
            }
            await websocket.send_json(data)
            await asyncio.sleep(0.1)  # Update every 100ms
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    print("🚗 Yaris Cockpit Demo Backend Starting...")
    print("📱 Optimized for Android/Termux")
    print("🌐 API available at: http://0.0.0.0:8000")
    print("📊 Mock sensor data will be generated")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )