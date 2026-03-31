#!/usr/bin/env python3
"""
OBD2 Interface
Communicates with OBD2 scanner via USB (ELM327)
"""

import logging
import obd

logger = logging.getLogger(__name__)

class OBDInterface:
    """Interface for OBD2 communication"""
    
    def __init__(self, port=None):
        """
        Initialize OBD interface
        
        Args:
            port: Serial port (auto-detect if None)
        """
        self.port = port
        self.connection = None
        self.supported_commands = set()
    
    def connect(self):
        """
        Connect to OBD2 scanner
        
        Returns:
            bool: True if connected successfully
        """
        try:
            # Try to auto-detect port if not specified
            if self.port:
                self.connection = obd.OBD(self.port)
            else:
                self.connection = obd.OBD()  # Auto-detect
            
            if self.connection.status() == obd.OBDStatus.CAR_CONNECTED:
                logger.info(f"OBD2 connected on port {self.port or 'auto'}")
                self.get_supported_commands()
                return True
            else:
                logger.warning("OBD2 scanner found but car not connected")
                return False
                
        except Exception as e:
            logger.error(f"Failed to connect OBD2: {e}")
            return False
    
    def get_supported_commands(self):
        """Get list of supported OBD commands"""
        try:
            self.supported_commands = self.connection.supported_commands
            logger.info(f"Supported commands: {len(self.supported_commands)}")
        except Exception as e:
            logger.error(f"Error getting supported commands: {e}")
    
    def read_data(self):
        """
        Read current vehicle data
        
        Returns:
            dict: Vehicle data (rpm, speed, temps, etc.)
        """
        if not self.connection or self.connection.status() != obd.OBDStatus.CAR_CONNECTED:
            return None
        
        data = {}
        
        try:
            # RPM
            response = self.connection.query(obd.commands.RPM)
            if response.is_null():
                data['rpm'] = 0
            else:
                data['rpm'] = int(response.value.magnitude)
        except:
            data['rpm'] = 0
        
        try:
            # Speed
            response = self.connection.query(obd.commands.SPEED)
            if response.is_null():
                data['speed'] = 0
            else:
                data['speed'] = int(response.value.magnitude)
        except:
            data['speed'] = 0
        
        try:
            # Engine Temperature
            response = self.connection.query(obd.commands.COOLANT_TEMP)
            if response.is_null():
                data['engine_temp'] = 0
            else:
                data['engine_temp'] = int(response.value.magnitude)
        except:
            data['engine_temp'] = 0
        
        try:
            # Oil Temperature (if available)
            if hasattr(obd.commands, 'OIL_TEMP'):
                response = self.connection.query(obd.commands.OIL_TEMP)
                if not response.is_null():
                    data['oil_temp'] = int(response.value.magnitude)
                else:
                    data['oil_temp'] = 0
            else:
                data['oil_temp'] = 0
        except:
            data['oil_temp'] = 0
        
        try:
            # Oil Pressure/Gear (if available)
            if hasattr(obd.commands, 'OIL_PRESS'):
                response = self.connection.query(obd.commands.OIL_PRESS)
                if not response.is_null():
                    data['oil_gear'] = int(response.value.magnitude)
                else:
                    data['oil_gear'] = 0
            else:
                data['oil_gear'] = 0
        except:
            data['oil_gear'] = 0
        
        try:
            # Boost Pressure (if available)
            if hasattr(obd.commands, 'BOOST_PRESS'):
                response = self.connection.query(obd.commands.BOOST_PRESS)
                if not response.is_null():
                    data['boost'] = float(response.value.magnitude)
                else:
                    data['boost'] = 0
            else:
                data['boost'] = 0
        except:
            data['boost'] = 0
        
        try:
            # CAT Sensor / O2 Sensor (Bank 1 Sensor 2 - After Cat)
            if hasattr(obd.commands, 'O2_S2'):
                response = self.connection.query(obd.commands.O2_S2)
                if not response.is_null():
                    data['cat_sensor'] = float(response.value.magnitude)
                else:
                    data['cat_sensor'] = 0
            else:
                data['cat_sensor'] = 0
        except:
            data['cat_sensor'] = 0
        
        try:
            # Voltage
            response = self.connection.query(obd.commands.VOLTAGE)
            if response.is_null():
                data['voltage'] = 0
            else:
                data['voltage'] = float(response.value.magnitude)
        except:
            data['voltage'] = 0
        
        try:
            # Throttle
            response = self.connection.query(obd.commands.THROTTLE_POS)
            if response.is_null():
                data['throttle'] = 0
            else:
                data['throttle'] = int(response.value.magnitude)
        except:
            data['throttle'] = 0
        
        return data
    
    def scan_all_sensors(self):
        """
        Scan and retrieve data from all supported sensors
        
        Returns:
            dict: Dictionary of all sensor values with their names
        """
        if not self.connection or self.connection.status() != obd.OBDStatus.CAR_CONNECTED:
            return {}
        
        all_sensors = {}
        
        # Get all supported Mode 01 commands (Live Data)
        for cmd in self.supported_commands:
            # Skip OBD PIDs list commands (PIDS_A, PIDS_B, PIDS_C)
            if cmd.mode == 1 and cmd.name not in ['PIDS_A', 'PIDS_B', 'PIDS_C']:
                try:
                    response = self.connection.query(cmd)
                    
                    if not response.is_null():
                        # Format the value
                        val = self._format_sensor_value(response)
                        all_sensors[cmd.name] = {
                            'value': val,
                            'command': cmd.name,
                            'desc': cmd.desc if hasattr(cmd, 'desc') else cmd.name
                        }
                except Exception as e:
                    logger.debug(f"Error reading {cmd.name}: {e}")
                    continue
        
        return all_sensors
    
    def _format_sensor_value(self, response):
        """
        Format OBD response value to readable format
        
        Args:
            response: OBD response object
            
        Returns:
            str: Formatted value with unit
        """
        if response.is_null():
            return "-"
        
        val = response.value
        
        # Check if value has magnitude (Quantity type with unit)
        if hasattr(val, 'magnitude'):
            try:
                # Get unit string
                if hasattr(val, 'units'):
                    unit_str = str(val.units)
                elif hasattr(val, 'unit'):
                    unit_str = str(val.unit)
                else:
                    unit_str = ""
                
                # Format based on magnitude size
                magnitude = val.magnitude
                if isinstance(magnitude, (int, float)):
                    if magnitude >= 1000:
                        return f"{magnitude:.0f} {unit_str}"
                    elif magnitude >= 10:
                        return f"{magnitude:.1f} {unit_str}"
                    else:
                        return f"{magnitude:.2f} {unit_str}"
                else:
                    return f"{magnitude} {unit_str}"
            except:
                return str(val)
        
        # Return as string for non-quantity values
        return str(val)
    
    def get_vin(self):
        """
        Get Vehicle Identification Number (VIN)
        
        Returns:
            str: VIN number or None if not available
        """
        if not self.connection or self.connection.status() != obd.OBDStatus.CAR_CONNECTED:
            return None
        
        try:
            # Query VIN (Mode 09, PID 02)
            response = self.connection.query(obd.commands.VIN)
            if not response.is_null():
                vin = str(response.value).strip()
                logger.info(f"Retrieved VIN: {vin}")
                return vin
            else:
                logger.warning("VIN not available from vehicle")
                return None
        except Exception as e:
            logger.error(f"Error reading VIN: {e}")
            return None
    
    def disconnect(self):
        """Disconnect from OBD2"""
        if self.connection:
            self.connection.close()
            logger.info("OBD2 disconnected")
