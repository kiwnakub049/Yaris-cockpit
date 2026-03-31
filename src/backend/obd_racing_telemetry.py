#!/usr/bin/env python3
"""
obd_racing_telemetry.py
High-Performance Racing Dashboard Telemetry System

Async OBD2 data acquisition optimized for real-time racing display.
Includes standard PIDs, custom Toyota PIDs, and calculated values.

Author: Senior Automotive Software Engineer
Vehicle: 2014 Toyota Yaris
Python Version: 3.9+
"""

import obd
from obd import OBDStatus
import time
import threading
from typing import Dict, Optional, Callable
from dataclasses import dataclass, asdict
from datetime import datetime

# Import custom modules
import sys
import os

# Add parent directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from drivers.custom_toyota_pids import (
    ATF_TEMP, 
    register_custom_commands,
    query_with_header
)
from utils.gear_calculator import YarisGearCalculator, GearType


@dataclass
class RacingTelemetry:
    """
    Complete racing telemetry data structure
    
    All values with units for clarity
    """
    # Timestamp
    timestamp: float = 0.0
    
    # Critical Racing Data (Priority 1 - 50-100ms)
    rpm: int = 0  # Engine RPM
    speed: int = 0  # km/h
    throttle: float = 0.0  # Percentage 0-100
    
    # Temperature Monitoring (Priority 1 - 500ms)
    coolant_temp: float = 0.0  # Celsius
    atf_temp: float = 0.0  # Celsius (Custom PID)
    
    # Engine Load & Performance (Priority 2 - 200ms)
    engine_load: float = 0.0  # Percentage
    
    # Additional Sensors (Priority 3 - 1000ms+)
    intake_temp: float = 0.0  # Celsius
    fuel_level: float = 0.0  # Percentage
    ambient_temp: float = 0.0  # Celsius
    
    # Calculated Values
    gear: str = "N"  # Current gear (1-6, D, N, R, P)
    gear_confidence: float = 0.0  # Confidence 0-1
    shift_recommendation: Optional[str] = None  # "UP" or "DOWN"
    
    # System Status
    is_shift_light: bool = False  # Shift warning at redline
    is_overheating: bool = False  # Coolant > 100°C
    is_atf_warning: bool = False  # ATF > 110°C
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)


class RacingDashboardTelemetry:
    """
    Main telemetry class for racing dashboard
    
    Features:
    - Async OBD connection (non-blocking)
    - Multi-tier query strategy (critical data faster)
    - Custom Toyota PID support
    - Intelligent gear detection
    - Automatic error recovery
    """
    
    def __init__(
        self, 
        port: Optional[str] = None,
        baudrate: int = 38400,
        protocol: Optional[str] = None,
        transmission_type: str = "cvt",
        debug: bool = False
    ):
        """
        Initialize racing telemetry system
        
        Args:
            port: Serial port (e.g., "/dev/ttyUSB0"). None = auto-detect
            baudrate: Baud rate for OBD adapter
            protocol: OBD protocol. None = auto-detect
            transmission_type: "manual" or "cvt"
            debug: Enable debug logging
        """
        self.port = port
        self.baudrate = baudrate
        self.protocol = protocol
        self.debug = debug
        
        # OBD Connection
        self.connection: Optional[obd.Async] = None
        self.is_connected = False
        
        # Telemetry data
        self.current_data = RacingTelemetry()
        self.data_lock = threading.Lock()
        
        # Gear calculator
        self.gear_calc = YarisGearCalculator(transmission_type=transmission_type)
        
        # Callback for real-time updates
        self.update_callback: Optional[Callable] = None
        
        # Performance tracking
        self.query_count = 0
        self.start_time = time.time()
        
        self._log("Racing Telemetry System initialized")
    
    def _log(self, message: str):
        """Thread-safe logging"""
        if self.debug:
            print(f"[Telemetry {time.strftime('%H:%M:%S')}] {message}")
    
    def connect(self) -> bool:
        """
        Connect to OBD adapter asynchronously
        
        Returns:
            bool: True if connection successful
        """
        try:
            self._log(f"Connecting to OBD adapter (port={self.port})...")
            
            # Create async connection
            self.connection = obd.Async(
                portstr=self.port,
                baudrate=self.baudrate,
                protocol=self.protocol,
                fast=False,  # Disable fast mode for compatibility
                timeout=30
            )
            
            # Check connection status
            if self.connection.status() == OBDStatus.CAR_CONNECTED:
                self.is_connected = True
                self._log(f"✓ Connected via {self.connection.protocol_name()}")
                self._log(f"✓ ECUs found: {self.connection.ecus}")
                
                # Register custom Toyota PIDs
                register_custom_commands(self.connection)
                
                return True
            else:
                self._log(f"✗ Connection failed: {self.connection.status()}")
                return False
                
        except Exception as e:
            self._log(f"✗ Connection error: {e}")
            return False
    
    def setup_queries(self):
        """
        Setup async watch queries for all sensors
        
        Strategy:
        - Critical data (RPM, Speed, Throttle): Watch with callback
        - Temperature data: Polled every 500ms
        - Secondary data: Polled every 1000ms
        """
        if not self.is_connected or not self.connection:
            self._log("Cannot setup queries - not connected")
            return False
        
        try:
            # === TIER 1: Critical Racing Data (Fastest) ===
            
            # RPM - Highest priority
            self.connection.watch(
                obd.commands.RPM,
                callback=self._rpm_callback,
                force=True
            )
            
            # Speed
            self.connection.watch(
                obd.commands.SPEED,
                callback=self._speed_callback,
                force=True
            )
            
            # Throttle Position
            self.connection.watch(
                obd.commands.THROTTLE_POS,
                callback=self._throttle_callback,
                force=True
            )
            
            # === TIER 2: Temperature Monitoring ===
            
            # Coolant Temperature
            self.connection.watch(
                obd.commands.COOLANT_TEMP,
                callback=self._coolant_callback
            )
            
            # === TIER 3: Engine Performance ===
            
            # Engine Load
            self.connection.watch(
                obd.commands.ENGINE_LOAD,
                callback=self._load_callback
            )
            
            # === TIER 4: Secondary Sensors ===
            
            # Intake Air Temp
            self.connection.watch(
                obd.commands.INTAKE_TEMP,
                callback=self._intake_temp_callback
            )
            
            # Fuel Level
            self.connection.watch(
                obd.commands.FUEL_LEVEL,
                callback=self._fuel_level_callback
            )
            
            self._log("✓ All standard PID queries configured")
            
            # Start async loop
            self.connection.start()
            self._log("✓ Async query loop started")
            
            # Setup custom PID polling (ATF temp)
            self._start_custom_pid_polling()
            
            return True
            
        except Exception as e:
            self._log(f"✗ Error setting up queries: {e}")
            return False
    
    def _start_custom_pid_polling(self):
        """
        Start background thread for custom PIDs that require header switching
        """
        def poll_custom_pids():
            while self.is_connected:
                try:
                    # Query ATF temperature (requires header 7E1)
                    response = query_with_header(self.connection, ATF_TEMP, "7E1")
                    
                    if not response.is_null():
                        with self.data_lock:
                            self.current_data.atf_temp = response.value.magnitude
                            self.current_data.is_atf_warning = self.current_data.atf_temp > 110
                        
                        self._log(f"ATF Temp: {response.value}")
                    
                except Exception as e:
                    self._log(f"Custom PID polling error: {e}")
                
                # Poll every 500ms
                time.sleep(0.5)
        
        polling_thread = threading.Thread(target=poll_custom_pids, daemon=True)
        polling_thread.start()
        self._log("✓ Custom PID polling thread started")
    
    # ========================================================================
    # CALLBACKS (Called when new data arrives)
    # ========================================================================
    
    def _rpm_callback(self, response):
        """Handle RPM updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.rpm = int(response.value.magnitude)
                self.current_data.timestamp = time.time()
                
                # Update shift light
                self.current_data.is_shift_light = self.current_data.rpm >= 6000
                
                # Trigger gear calculation
                self._calculate_gear()
                
            self.query_count += 1
            self._trigger_update()
    
    def _speed_callback(self, response):
        """Handle speed updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.speed = int(response.value.magnitude)
                
                # Trigger gear calculation
                self._calculate_gear()
                
            self._trigger_update()
    
    def _throttle_callback(self, response):
        """Handle throttle position updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.throttle = response.value.magnitude
            self._trigger_update()
    
    def _coolant_callback(self, response):
        """Handle coolant temperature updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.coolant_temp = response.value.magnitude
                self.current_data.is_overheating = self.current_data.coolant_temp > 100
            self._trigger_update()
    
    def _load_callback(self, response):
        """Handle engine load updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.engine_load = response.value.magnitude
            self._trigger_update()
    
    def _intake_temp_callback(self, response):
        """Handle intake air temp updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.intake_temp = response.value.magnitude
    
    def _fuel_level_callback(self, response):
        """Handle fuel level updates"""
        if not response.is_null():
            with self.data_lock:
                self.current_data.fuel_level = response.value.magnitude
    
    def _calculate_gear(self):
        """Calculate current gear based on RPM and speed"""
        rpm = self.current_data.rpm
        speed = self.current_data.speed
        
        if rpm > 0 and speed >= 0:
            gear_type, confidence = self.gear_calc.detect_gear(rpm, speed)
            
            self.current_data.gear = self.gear_calc.get_gear_display_string(gear_type)
            self.current_data.gear_confidence = confidence
            self.current_data.shift_recommendation = self.gear_calc.get_shift_recommendation(rpm, gear_type)
    
    def _trigger_update(self):
        """Call update callback if registered"""
        if self.update_callback:
            try:
                self.update_callback(self.current_data.to_dict())
            except Exception as e:
                self._log(f"Callback error: {e}")
    
    def set_update_callback(self, callback: Callable):
        """
        Register callback for real-time updates
        
        Args:
            callback: Function to call with telemetry dict
            
        Example:
            >>> def on_update(data):
            >>>     print(f"RPM: {data['rpm']}")
            >>> telemetry.set_update_callback(on_update)
        """
        self.update_callback = callback
        self._log("Update callback registered")
    
    async def async_get_current_data(self) -> Dict:
        """
        Async version of get_current_data for FastAPI WebSocket
        
        Returns:
            Dict: Current telemetry data
        """
        return self.get_current_data()
    
    def get_current_data(self) -> Dict:
        """
        Get current telemetry data snapshot
        
        Thread-safe access to latest data
        
        Returns:
            Dict: Current telemetry data
        """
        with self.data_lock:
            return self.current_data.to_dict()
    
    def get_stats(self) -> Dict:
        """
        Get performance statistics
        
        Returns:
            Dict: Performance metrics
        """
        uptime = time.time() - self.start_time
        query_rate = self.query_count / uptime if uptime > 0 else 0
        
        return {
            "uptime_seconds": uptime,
            "total_queries": self.query_count,
            "query_rate_hz": query_rate,
            "is_connected": self.is_connected
        }
    
    def disconnect(self):
        """Gracefully disconnect from OBD"""
        if self.connection:
            self._log("Disconnecting from OBD...")
            self.connection.stop()
            self.connection.close()
            self.is_connected = False
            self._log("Disconnected")


# ============================================================================
# MAIN - EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    """
    Test the racing telemetry system
    """
    print("=" * 70)
    print("Yaris Racing Dashboard - Telemetry Test")
    print("=" * 70)
    
    # Create telemetry instance
    telemetry = RacingDashboardTelemetry(
        port=None,  # Auto-detect
        transmission_type="cvt",
        debug=True
    )
    
    # Define update callback
    def on_telemetry_update(data):
        """Print formatted telemetry to console"""
        print("\r" + " " * 100 + "\r", end="")  # Clear line
        print(
            f"RPM: {data['rpm']:4d} | "
            f"Speed: {data['speed']:3d} km/h | "
            f"Gear: {data['gear']:2s} | "
            f"Throttle: {data['throttle']:5.1f}% | "
            f"Coolant: {data['coolant_temp']:5.1f}°C | "
            f"ATF: {data['atf_temp']:5.1f}°C",
            end=""
        )
    
    # Register callback
    telemetry.set_update_callback(on_telemetry_update)
    
    # Connect and start
    if telemetry.connect():
        print("\n✓ Connected successfully!")
        
        if telemetry.setup_queries():
            print("✓ Queries configured - Live data streaming...")
            print("\nPress Ctrl+C to stop\n")
            
            try:
                # Run for 60 seconds or until interrupted
                while True:
                    time.sleep(1)
                    
            except KeyboardInterrupt:
                print("\n\nStopping...")
                
                # Show statistics
                stats = telemetry.get_stats()
                print("\nPerformance Statistics:")
                print(f"  Uptime: {stats['uptime_seconds']:.1f}s")
                print(f"  Total Queries: {stats['total_queries']}")
                print(f"  Query Rate: {stats['query_rate_hz']:.1f} Hz")
                
                telemetry.disconnect()
        else:
            print("✗ Failed to configure queries")
    else:
        print("✗ Failed to connect to OBD adapter")
        print("\nTroubleshooting:")
        print("  1. Check USB connection")
        print("  2. Verify ignition is ON")
        print("  3. Check /dev/ttyUSB0 permissions")
        print("  4. Try: ls /dev/tty* to find correct port")
    
    print("\n" + "=" * 70)
