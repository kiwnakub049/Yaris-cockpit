#!/usr/bin/env python3
"""
GPS Interface
Reads data from USB GPS module via gpsd
"""

import logging
import socket
from gps3 import gps3

logger = logging.getLogger(__name__)

class GPSInterface:
    """Interface for GPS data reading"""
    
    def __init__(self, host='localhost', port=2947):
        """
        Initialize GPS interface
        
        Args:
            host: gpsd host (localhost for local)
            port: gpsd port (default 2947)
        """
        self.host = host
        self.port = port
        self.stream = None
        self.connected = False
    
    def connect(self):
        """
        Connect to gpsd service
        
        Returns:
            bool: True if connected successfully
        """
        try:
            self.stream = gps3.GPSDSocket()
            self.stream.connect(self.host, self.port)
            self.connected = True
            logger.info(f"GPS connected to {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.warning(f"GPS connection failed: {e}")
            self.connected = False
            return False
    
    def read_data(self):
        """
        Read current GPS data
        
        Returns:
            dict: GPS data (latitude, longitude, speed, heading, etc.)
        """
        if not self.connected:
            return None
        
        data = {}
        
        try:
            # Read GPS data
            self.stream.unpack()
            
            # Get current data from stream
            current_value = {}
            for report in self.stream:
                if report['class'] == 'TPP' and report['type'] == 'TPP':
                    current_value = report
                    break
            
            # Extract fields
            if hasattr(self.stream, 'lat') and self.stream.lat:
                data['latitude'] = float(self.stream.lat)
            else:
                data['latitude'] = 0.0
            
            if hasattr(self.stream, 'lon') and self.stream.lon:
                data['longitude'] = float(self.stream.lon)
            else:
                data['longitude'] = 0.0
            
            if hasattr(self.stream, 'speed') and self.stream.speed:
                # Convert m/s to km/h
                data['speed'] = float(self.stream.speed) * 3.6
            else:
                data['speed'] = 0.0
            
            if hasattr(self.stream, 'track') and self.stream.track:
                data['heading'] = float(self.stream.track)
            else:
                data['heading'] = 0.0
            
            if hasattr(self.stream, 'alt') and self.stream.alt:
                data['altitude'] = float(self.stream.alt)
            else:
                data['altitude'] = 0.0
            
            if hasattr(self.stream, 'satellites') and self.stream.satellites:
                data['satellites'] = int(self.stream.satellites)
            else:
                data['satellites'] = 0
            
            return data if any(data.values()) else None
            
        except Exception as e:
            logger.debug(f"GPS read error: {e}")
            return None
    
    def disconnect(self):
        """Disconnect from GPS"""
        if self.stream:
            self.stream.close()
            self.connected = False
            logger.info("GPS disconnected")
