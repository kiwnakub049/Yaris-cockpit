#!/usr/bin/env python3
"""
Application Settings
Central configuration for the entire application
"""

import os
import json
import logging

logger = logging.getLogger(__name__)

class AppConfig:
    """Application configuration"""
    
    def __init__(self, config_file='config/app_config.json'):
        """
        Initialize configuration
        
        Args:
            config_file: Path to configuration file
        """
        self.config_file = config_file
        
        # Default settings
        self.DISPLAY_WIDTH = 1920
        self.DISPLAY_HEIGHT = 1080
        
        # OBD2 Settings
        self.OBD_PORT = None  # Auto-detect
        self.OBD_BAUDRATE = 115200
        self.OBD_TIMEOUT = 2.0
        self.OBD_POLL_INTERVAL = 0.05  # seconds
        
        # GPS Settings
        self.GPS_HOST = 'localhost'
        self.GPS_PORT = 2947
        self.GPS_POLL_INTERVAL = 0.2  # seconds
        
        # UI Settings
        self.FULLSCREEN = True
        self.THEME = 'dark'
        self.FONT_SIZE = 12
        
        # Audio Settings
        self.AUDIO_DUCKING_ENABLED = True
        self.ALERT_VOLUME = 100
        self.MUSIC_VOLUME = 80
        
        # Temperature Settings (Celsius)
        self.TEMP_WARNING = 100
        self.TEMP_CRITICAL = 110
        self.RPM_WARNING = 6500
        self.RPM_CRITICAL = 7000
        
        # Load from file if exists
        if os.path.exists(config_file):
            self.load_from_file()
    
    def load_from_file(self):
        """Load settings from JSON file"""
        try:
            with open(self.config_file, 'r') as f:
                data = json.load(f)
                for key, value in data.items():
                    if hasattr(self, key.upper()):
                        setattr(self, key.upper(), value)
            logger.info(f"Configuration loaded from {self.config_file}")
        except Exception as e:
            logger.warning(f"Failed to load config file: {e}")
    
    def save_to_file(self):
        """Save current settings to JSON file"""
        try:
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            
            data = {}
            for key in dir(self):
                if key.isupper() and not key.startswith('_'):
                    data[key.lower()] = getattr(self, key)
            
            with open(self.config_file, 'w') as f:
                json.dump(data, f, indent=4)
            
            logger.info(f"Configuration saved to {self.config_file}")
        except Exception as e:
            logger.error(f"Failed to save config file: {e}")
    
    def get(self, key, default=None):
        """Get configuration value"""
        key_upper = key.upper()
        return getattr(self, key_upper, default)
    
    def set(self, key, value):
        """Set configuration value"""
        key_upper = key.upper()
        setattr(self, key_upper, value)
        logger.debug(f"Config {key_upper} = {value}")
