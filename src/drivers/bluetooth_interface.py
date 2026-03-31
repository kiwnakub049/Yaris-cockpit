#!/usr/bin/env python3
"""
Bluetooth Interface
Manages Bluetooth audio and AVRCP (media controls)
"""

import logging
import subprocess
import dbus

logger = logging.getLogger(__name__)

class BluetoothInterface:
    """Interface for Bluetooth audio and controls"""
    
    def __init__(self):
        """Initialize Bluetooth interface"""
        self.connected_device = None
        self.dbus_bus = dbus.SystemBus()
    
    def get_connected_devices(self):
        """
        Get list of connected Bluetooth devices
        
        Returns:
            list: List of device names/addresses
        """
        try:
            result = subprocess.run(['bluetoothctl', 'devices'], 
                                  capture_output=True, text=True)
            devices = []
            for line in result.stdout.strip().split('\n'):
                if line:
                    parts = line.split()
                    if len(parts) >= 2:
                        devices.append({
                            'address': parts[1],
                            'name': ' '.join(parts[2:])
                        })
            return devices
        except Exception as e:
            logger.error(f"Error getting Bluetooth devices: {e}")
            return []
    
    def connect_to_device(self, device_address):
        """
        Connect to Bluetooth device
        
        Args:
            device_address: Bluetooth MAC address
            
        Returns:
            bool: True if connected successfully
        """
        try:
            subprocess.run(['bluetoothctl', 'connect', device_address], 
                         check=True, capture_output=True)
            self.connected_device = device_address
            logger.info(f"Connected to Bluetooth device: {device_address}")
            return True
        except Exception as e:
            logger.error(f"Bluetooth connection error: {e}")
            return False
    
    def play(self):
        """Play media"""
        try:
            subprocess.run(['playerctl', 'play'], capture_output=True)
            logger.debug("Play command sent")
        except:
            logger.debug("playerctl not available")
    
    def pause(self):
        """Pause media"""
        try:
            subprocess.run(['playerctl', 'pause'], capture_output=True)
            logger.debug("Pause command sent")
        except:
            logger.debug("playerctl not available")
    
    def next(self):
        """Skip to next track"""
        try:
            subprocess.run(['playerctl', 'next'], capture_output=True)
            logger.debug("Next command sent")
        except:
            logger.debug("playerctl not available")
    
    def previous(self):
        """Skip to previous track"""
        try:
            subprocess.run(['playerctl', 'previous'], capture_output=True)
            logger.debug("Previous command sent")
        except:
            logger.debug("playerctl not available")
    
    def get_current_song(self):
        """
        Get current playing song info
        
        Returns:
            dict: Song metadata (title, artist, album)
        """
        try:
            title = subprocess.run(['playerctl', 'metadata', 'title'], 
                                 capture_output=True, text=True).stdout.strip()
            artist = subprocess.run(['playerctl', 'metadata', 'artist'], 
                                  capture_output=True, text=True).stdout.strip()
            album = subprocess.run(['playerctl', 'metadata', 'album'], 
                                 capture_output=True, text=True).stdout.strip()
            
            return {
                'title': title or 'Unknown',
                'artist': artist or 'Unknown',
                'album': album or 'Unknown'
            }
        except:
            return {
                'title': 'Unknown',
                'artist': 'Unknown',
                'album': 'Unknown'
            }
    
    def disconnect(self):
        """Disconnect from Bluetooth device"""
        if self.connected_device:
            try:
                subprocess.run(['bluetoothctl', 'disconnect', self.connected_device],
                             capture_output=True)
                logger.info("Bluetooth disconnected")
            except Exception as e:
                logger.error(f"Error disconnecting: {e}")
            self.connected_device = None
