#!/usr/bin/env python3
"""
Test module - Unit tests for various components
"""

import unittest
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

class TestOBDInterface(unittest.TestCase):
    """Test OBD2 interface"""
    
    def test_obd_init(self):
        """Test OBD interface initialization"""
        from drivers.obd_interface import OBDInterface
        obd = OBDInterface()
        self.assertIsNotNone(obd)

class TestGPSInterface(unittest.TestCase):
    """Test GPS interface"""
    
    def test_gps_init(self):
        """Test GPS interface initialization"""
        from drivers.gps_interface import GPSInterface
        gps = GPSInterface()
        self.assertIsNotNone(gps)

class TestHelpers(unittest.TestCase):
    """Test helper functions"""
    
    def test_conversion_functions(self):
        """Test unit conversion functions"""
        from utils.helpers import convert_kmh_to_mph, convert_celsius_to_fahrenheit
        
        # Test km/h to mph conversion
        self.assertAlmostEqual(convert_kmh_to_mph(100), 62.1371, places=3)
        
        # Test Celsius to Fahrenheit conversion
        self.assertEqual(convert_celsius_to_fahrenheit(0), 32)
        self.assertEqual(convert_celsius_to_fahrenheit(100), 212)

if __name__ == '__main__':
    unittest.main()
