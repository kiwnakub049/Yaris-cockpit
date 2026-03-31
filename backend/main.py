#!/usr/bin/env python3
"""
Yaris Cockpit Web Backend
FastAPI server for serving UI and providing WebSocket API
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
from pathlib import Path
import sys

# Add src directory to path for importing custom modules
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from backend.obd_racing_telemetry import RacingDashboardTelemetry
from backend.gps_telemetry import GPSTelemetry
from drivers.obd_interface import OBDInterface
from utils.vehicle_config import VehicleSensorConfig

app = FastAPI(title="Yaris Cockpit API")

# Global telemetry instances
racing_telemetry = None
gps_telemetry = None
obd_scanner = None
vehicle_config = VehicleSensorConfig()  # Vehicle sensor config manager

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (production build)
static_path = Path(__file__).parent.parent / "web_ui" / "dist"
if static_path.exists():
    app.mount("/assets", StaticFiles(directory=static_path / "assets"), name="assets")

# WebSocket for real-time data (legacy - for backward compatibility)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulate OBD data (later connect to actual drivers)
            data = {
                "rpm": 3500,
                "speed": 65,
                "temp": 92,
                "throttle": 45,
                "fuel": 42.5,
            }
            await websocket.send_json(data)
            await asyncio.sleep(0.05)  # 20Hz update rate
    except Exception as e:
        print(f"WebSocket error: {e}")

# Racing Dashboard WebSocket - High Performance OBD2 Telemetry
@app.websocket("/ws/racing")
async def racing_websocket(websocket: WebSocket):
    """
    High-performance WebSocket endpoint for racing dashboard
    
    Streams real-time OBD2 telemetry at 20Hz (50ms refresh)
    Includes custom Toyota PIDs and gear calculation
    """
    await websocket.accept()
    
    global racing_telemetry
    
    # Initialize telemetry on first connection
    if racing_telemetry is None:
        racing_telemetry = RacingDashboardTelemetry(
            port=None,  # Auto-detect
            transmission_type="cvt",
            debug=False
        )
        
        # Try to connect to OBD
        if racing_telemetry.connect():
            racing_telemetry.setup_queries()
            print("✓ Racing telemetry connected to OBD2")
        else:
            print("⚠ OBD2 not available - using simulation mode")
    
    try:
        while True:
            # Get current telemetry data
            if racing_telemetry.is_connected:
                # Real OBD2 data
                data = await racing_telemetry.async_get_current_data()
            else:
                # Simulation mode (for testing without OBD adapter)
                import time
                import math
                t = time.time()
                simulated_rpm = int(2000 + 3000 * (0.5 + 0.5 * math.sin(t * 0.5)))
                simulated_speed = int(simulated_rpm / 100)
                
                data = {
                    "timestamp": t,
                    "rpm": simulated_rpm,
                    "speed": simulated_speed,
                    "throttle": 45.0 + 30 * math.sin(t * 0.3),
                    "coolant_temp": 88.0,
                    "atf_temp": 95.0,
                    "engine_load": 35.0,
                    "intake_temp": 25.0,
                    "fuel_level": 65.0,
                    "ambient_temp": 28.0,
                    "gear": "D" if simulated_rpm < 5000 else "S",
                    "gear_confidence": 0.95,
                    "shift_recommendation": "UP" if simulated_rpm > 6000 else None,
                    "is_shift_light": simulated_rpm >= 6000,
                    "is_overheating": False,
                    "is_atf_warning": False
                }
            
            await websocket.send_json(data)
            await asyncio.sleep(0.05)  # 20Hz = 50ms refresh rate
            
    except WebSocketDisconnect:
        print("Racing dashboard WebSocket disconnected")
    except Exception as e:
        print(f"Racing WebSocket error: {e}")
    finally:
        # Clean up on disconnect
        pass

# REST API endpoints
@app.get("/api/status")
async def get_status():
    """Get connection status of all systems"""
    global racing_telemetry, gps_telemetry
    
    return {
        "obd_connected": racing_telemetry.is_connected if racing_telemetry else False,
        "gps_connected": gps_telemetry.is_connected() if gps_telemetry else False,
        "bluetooth_connected": False,  # TODO: Implement Bluetooth
    }

@app.get("/api/obd")
async def get_obd_data():
    """Get current OBD data snapshot"""
    global racing_telemetry
    
    if racing_telemetry and racing_telemetry.is_connected:
        return racing_telemetry.get_current_data()
    else:
        return {
            "rpm": 0,
            "speed": 0,
            "coolant_temp": 0,
            "voltage": 12.4,
        }

@app.get("/api/racing/stats")
async def get_racing_stats():
    """Get racing telemetry performance statistics"""
    global racing_telemetry
    
    if racing_telemetry:
        return racing_telemetry.get_stats()
    else:
        return {"error": "Telemetry not initialized"}

# GPS WebSocket - Real-time position streaming
@app.websocket("/ws/gps")
async def gps_websocket(websocket: WebSocket):
    """
    GPS WebSocket endpoint for real-time position tracking
    
    Streams GPS data at 5Hz (200ms refresh)
    Returns: latitude, longitude, speed, heading, altitude, satellites
    """
    await websocket.accept()
    
    global gps_telemetry
    
    # Initialize GPS telemetry on first connection
    if gps_telemetry is None:
        gps_telemetry = GPSTelemetry()
        gps_telemetry.start()
        print("✓ GPS telemetry initialized")
    
    try:
        async for gps_data in gps_telemetry.stream_gps_data():
            await websocket.send_json(gps_data)
            
    except WebSocketDisconnect:
        print("GPS WebSocket disconnected")
    except Exception as e:
        print(f"GPS WebSocket error: {e}")

# OBD2 All Sensors Scanner WebSocket
@app.websocket("/ws/obd/scanner")
async def obd_scanner_websocket(websocket: WebSocket):
    """
    Full OBD2 sensor scanner WebSocket endpoint
    
    Streams all available sensor data at 2Hz (500ms refresh)
    Returns: Complete sensor map with all supported OBD commands
    """
    print("🔌 New OBD Scanner WebSocket connection attempt")
    await websocket.accept()
    print("✓ OBD Scanner WebSocket accepted")
    
    global obd_scanner
    
    # Initialize OBD scanner on first connection
    if obd_scanner is None:
        print("📡 Initializing OBD Scanner...")
        obd_scanner = OBDInterface(port=None)  # Auto-detect
        if obd_scanner.connect():
            print(f"✓ OBD Scanner connected - {len(obd_scanner.supported_commands)} commands supported")
        else:
            print("⚠ OBD2 not available - scanner in offline mode")
    
    try:
        while True:
            if obd_scanner and obd_scanner.connection:
                # Scan all sensors
                sensor_data = obd_scanner.scan_all_sensors()
                
                # Send data with metadata
                response = {
                    "timestamp": asyncio.get_event_loop().time(),
                    "connected": True,
                    "total_sensors": len(sensor_data),
                    "sensors": sensor_data
                }
                print(f"📊 Sending {len(sensor_data)} sensors data")
            else:
                # Offline mode
                response = {
                    "timestamp": asyncio.get_event_loop().time(),
                    "connected": False,
                    "total_sensors": 0,
                    "sensors": {}
                }
                print("⚠ Sending offline mode data (no OBD2 connected)")
            
            await websocket.send_json(response)
            await asyncio.sleep(0.5)  # 2Hz = 500ms refresh rate
            
    except WebSocketDisconnect:
        print("🔌 OBD Scanner WebSocket disconnected")
    except Exception as e:
        print(f"❌ OBD Scanner WebSocket error: {e}")
        import traceback
        traceback.print_exc()

@app.get("/api/gps")
async def get_gps_data():
    """Get current GPS position snapshot"""
    global gps_telemetry
    
    if gps_telemetry is None:
        gps_telemetry = GPSTelemetry()
        gps_telemetry.start()
    
    return await gps_telemetry.get_current_position()

# OBD2 Vehicle Configuration Endpoints
@app.get("/api/obd/vin")
async def get_vehicle_vin():
    """Get Vehicle Identification Number (VIN)"""
    global obd_scanner
    
    # Initialize OBD scanner if not already
    if obd_scanner is None:
        obd_scanner = OBDInterface(port=None)
        if not obd_scanner.connect():
            return {"error": "OBD2 not connected", "vin": None}
    
    vin = obd_scanner.get_vin()
    
    if vin:
        # Also load saved config for this VIN
        config = vehicle_config.load_sensor_config(vin)
        return {
            "vin": vin,
            "has_config": config is not None,
            "config": config
        }
    else:
        return {"error": "VIN not available", "vin": None}

@app.post("/api/obd/sensors/save")
async def save_sensor_config(data: dict):
    """
    Save sensor configuration for a vehicle
    
    Request body:
        {
            "vin": "VEHICLE_VIN",
            "sensors": ["RPM", "SPEED", "COOLANT_TEMP", ...],
            "metadata": {"model": "Yaris", "year": 2024}
        }
    """
    vin = data.get("vin")
    sensors = data.get("sensors", [])
    metadata = data.get("metadata", {})
    
    if not vin:
        return {"success": False, "error": "VIN is required"}
    
    if not sensors:
        return {"success": False, "error": "Sensors list is required"}
    
    success = vehicle_config.save_sensor_config(vin, sensors, metadata)
    
    if success:
        return {
            "success": True,
            "message": f"Saved {len(sensors)} sensors for VIN {vin}"
        }
    else:
        return {"success": False, "error": "Failed to save configuration"}

@app.get("/api/obd/sensors/config")
async def get_sensor_config(vin: str = None):
    """
    Get sensor configuration for a vehicle
    
    Query params:
        vin: Vehicle Identification Number (optional, auto-detect if not provided)
    """
    # If no VIN provided, try to get current VIN
    if not vin:
        global obd_scanner
        if obd_scanner is None:
            obd_scanner = OBDInterface(port=None)
            obd_scanner.connect()
        
        vin = obd_scanner.get_vin() if obd_scanner else None
    
    if not vin:
        return {"error": "VIN not available", "config": None}
    
    config = vehicle_config.load_sensor_config(vin)
    
    if config:
        return {"success": True, "config": config}
    else:
        return {"success": False, "error": "No configuration found for this VIN"}

@app.get("/api/obd/sensors/list")
async def list_all_configs():
    """Get all saved vehicle sensor configurations"""
    configs = vehicle_config.get_all_configs()
    return {"success": True, "count": len(configs), "configs": configs}

@app.delete("/api/obd/sensors/config")
async def delete_sensor_config(vin: str):
    """Delete sensor configuration for a vehicle"""
    if not vin:
        return {"success": False, "error": "VIN is required"}
    
    success = vehicle_config.delete_config(vin)
    
    if success:
        return {"success": True, "message": f"Deleted configuration for VIN {vin}"}
    else:
        return {"success": False, "error": "Configuration not found or failed to delete"}

@app.post("/api/desktop")
async def switch_to_desktop():
    """Minimize Chromium and show desktop"""
    import subprocess
    print("=" * 70)
    print("Yaris Cockpit Backend Server")
    print("=" * 70)
    print("WebSocket endpoints:")
    print("  /ws         - Legacy general telemetry")
    print("  /ws/racing  - Racing dashboard (high-performance)")
    print("\nREST API endpoints:")
    print("  /api/status - System status")
    print("  /api/obd    - OBD data snapshot")
    print("  /api/racing/stats - Telemetry statistics")
    print("=" * 70)
    
    try:
        # Try multiple methods to minimize/close Chromium
        # Method 1: Kill Chromium gracefully
        subprocess.run(["pkill", "-f", "chromium"], check=False)
        return {"status": "success", "message": "Switched to desktop"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Serve React app for all other routes
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if static_path.exists():
        index_file = static_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "UI not built. Run 'npm run build' in web_ui/"}

if __name__ == "__main__":
    # Production optimization for Raspberry Pi 4
    # Use multiprocess workers to utilize all 4 CPU cores
    import multiprocessing
    
    # Set number of workers based on CPU cores
    workers = multiprocessing.cpu_count()  # 4 cores for RPi 4
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=workers,
        log_level="warning",  # Reduce logging overhead
        access_log=False,  # Disable access logs for performance
        use_colors=False,
        timeout_keep_alive=30,
        limit_concurrency=100,
        backlog=2048
    )
