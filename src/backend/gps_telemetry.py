"""
GPS Telemetry Worker for Yaris Cockpit
Streams real-time GPS data at 5Hz
"""
import asyncio
import logging
from typing import Dict, Optional
from drivers.gps_interface import GPSInterface

logger = logging.getLogger(__name__)

class GPSTelemetry:
    def __init__(self):
        self.gps = GPSInterface()
        self.running = False
        self._last_data: Optional[Dict] = None
        
    def start(self):
        """Start GPS interface"""
        try:
            self.gps.connect()
            self.running = True
            logger.info("GPS Telemetry started")
        except Exception as e:
            logger.error(f"Failed to start GPS: {e}")
            self.running = False
            
    def stop(self):
        """Stop GPS interface"""
        self.running = False
        self.gps.disconnect()
        logger.info("GPS Telemetry stopped")
        
    def is_connected(self) -> bool:
        """Check if GPS is connected and has valid data"""
        return self.running and self._last_data is not None
        
    async def get_current_position(self) -> Dict:
        """Get current GPS position (async snapshot)"""
        if not self.running:
            return {
                'connected': False,
                'latitude': 0,
                'longitude': 0,
                'speed': 0,
                'heading': 0,
                'altitude': 0,
                'satellites': 0
            }
            
        try:
            data = self.gps.read_data()
            self._last_data = data
            return {
                'connected': True,
                'latitude': data.get('latitude', 0),
                'longitude': data.get('longitude', 0),
                'speed': data.get('speed', 0),
                'heading': data.get('heading', 0),
                'altitude': data.get('altitude', 0),
                'satellites': data.get('satellites', 0)
            }
        except Exception as e:
            logger.error(f"GPS read error: {e}")
            return {
                'connected': False,
                'latitude': 0,
                'longitude': 0,
                'speed': 0,
                'heading': 0,
                'altitude': 0,
                'satellites': 0
            }
            
    async def stream_gps_data(self, interval: float = 0.2):
        """
        Stream GPS data generator at specified interval (default 5Hz)
        Yields GPS data dict every 200ms
        """
        while self.running:
            yield await self.get_current_position()
            await asyncio.sleep(interval)
