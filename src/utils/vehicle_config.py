"""
Vehicle Configuration Manager
Manages sensor configurations per VIN
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class VehicleSensorConfig:
    """Manages vehicle-specific sensor configurations"""
    
    def __init__(self, config_dir: str = None):
        """
        Initialize vehicle config manager
        
        Args:
            config_dir: Directory to store config files (default: ./config/vehicles)
        """
        if config_dir is None:
            # Default to config/vehicles directory
            config_dir = Path(__file__).parent.parent.parent / "config" / "vehicles"
        
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Vehicle config directory: {self.config_dir}")
    
    def _get_config_path(self, vin: str) -> Path:
        """Get config file path for a VIN"""
        # Sanitize VIN for filename
        safe_vin = "".join(c for c in vin if c.isalnum())
        return self.config_dir / f"{safe_vin}.json"
    
    def save_sensor_config(self, vin: str, sensors: List[str], metadata: Dict = None):
        """
        Save sensor configuration for a vehicle
        
        Args:
            vin: Vehicle Identification Number
            sensors: List of sensor names to save
            metadata: Optional metadata (vehicle model, year, etc.)
        """
        if not vin:
            logger.error("Cannot save config: VIN is empty")
            return False
        
        config_path = self._get_config_path(vin)
        
        config_data = {
            "vin": vin,
            "sensors": sensors,
            "metadata": metadata or {},
            "last_updated": self._get_timestamp()
        }
        
        try:
            with open(config_path, 'w') as f:
                json.dump(config_data, f, indent=2)
            
            logger.info(f"Saved sensor config for VIN {vin}: {len(sensors)} sensors")
            return True
        except Exception as e:
            logger.error(f"Failed to save sensor config: {e}")
            return False
    
    def load_sensor_config(self, vin: str) -> Optional[Dict]:
        """
        Load sensor configuration for a vehicle
        
        Args:
            vin: Vehicle Identification Number
            
        Returns:
            dict: Config data or None if not found
        """
        if not vin:
            return None
        
        config_path = self._get_config_path(vin)
        
        if not config_path.exists():
            logger.info(f"No config found for VIN {vin}")
            return None
        
        try:
            with open(config_path, 'r') as f:
                config_data = json.load(f)
            
            logger.info(f"Loaded sensor config for VIN {vin}: {len(config_data.get('sensors', []))} sensors")
            return config_data
        except Exception as e:
            logger.error(f"Failed to load sensor config: {e}")
            return None
    
    def get_all_configs(self) -> List[Dict]:
        """
        Get all saved vehicle configurations
        
        Returns:
            list: List of all config data
        """
        configs = []
        
        for config_file in self.config_dir.glob("*.json"):
            try:
                with open(config_file, 'r') as f:
                    config_data = json.load(f)
                    configs.append(config_data)
            except Exception as e:
                logger.error(f"Error reading {config_file}: {e}")
        
        return configs
    
    def delete_config(self, vin: str) -> bool:
        """
        Delete sensor configuration for a vehicle
        
        Args:
            vin: Vehicle Identification Number
            
        Returns:
            bool: True if deleted successfully
        """
        if not vin:
            return False
        
        config_path = self._get_config_path(vin)
        
        if config_path.exists():
            try:
                config_path.unlink()
                logger.info(f"Deleted config for VIN {vin}")
                return True
            except Exception as e:
                logger.error(f"Failed to delete config: {e}")
                return False
        
        return False
    
    def _get_timestamp(self) -> str:
        """Get current timestamp as ISO string"""
        from datetime import datetime
        return datetime.now().isoformat()
