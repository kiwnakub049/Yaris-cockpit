#!/usr/bin/env python3
"""
Yaris Cockpit - Version Information
"""

import sys
from pathlib import Path

# Package information
__version__ = "1.0.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"
__license__ = "MIT"
__url__ = "https://github.com/yourusername/yaris-cockpit"
__description__ = "Digital Dashboard for Toyota Yaris 2014"

# Version components
VERSION_MAJOR = 1
VERSION_MINOR = 0
VERSION_PATCH = 0
VERSION_BUILD = "stable"

# Features
FEATURES = [
    "5 Display Modes (Racing, Info, CarPlay, Bluetooth, Desktop)",
    "OBD2 Scanner Support (ELM327)",
    "GPS Module Integration",
    "Carlinkit CarPlay Support",
    "Bluetooth Audio Control",
    "Multi-threaded Architecture",
    "Responsive UI (60 FPS)",
    "Comprehensive Logging",
    "Configuration Management",
]

# Requirements
REQUIREMENTS = [
    "Python 3.8+",
    "PyQt5 5.15+",
    "Raspberry Pi 4/5",
    "Raspberry Pi OS 64-bit Desktop",
    "7-inch HDMI Display (1024x600+)",
]

def print_version():
    """Print version information"""
    print(f"Yaris 2014 Ultimate Cockpit v{__version__}")
    print(f"License: {__license__}")
    print(f"Author: {__author__}")
    print()
    print("Features:")
    for feature in FEATURES:
        print(f"  ✓ {feature}")
    print()
    print("Requirements:")
    for req in REQUIREMENTS:
        print(f"  • {req}")

def check_dependencies():
    """Check if all dependencies are installed"""
    dependencies = {
        'PyQt5': 'PyQt5 GUI Framework',
        'obd': 'OBD2 Communication',
        'gps3': 'GPS Data Reading',
        'pulsectl': 'Audio Control',
        'PIL': 'Image Processing (Pillow)',
    }
    
    print("Checking dependencies...")
    print("=" * 50)
    
    missing = []
    for module, description in dependencies.items():
        try:
            __import__(module)
            print(f"✓ {module:15} - {description}")
        except ImportError:
            print(f"✗ {module:15} - {description} (MISSING)")
            missing.append(module)
    
    print("=" * 50)
    
    if missing:
        print(f"\nMissing {len(missing)} dependency/dependencies:")
        for module in missing:
            print(f"  pip install {module}")
        return False
    else:
        print("\n✓ All dependencies are installed!")
        return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == '--check':
            check_dependencies()
        elif sys.argv[1] == '--version':
            print(f"v{__version__}")
        elif sys.argv[1] == '--info':
            print_version()
    else:
        print_version()
