#!/usr/bin/env python3
"""
Constants
Defines application-wide constants
"""

# Display modes
MODE_RACING = 0
MODE_INFO = 1
MODE_CARPLAY = 2
MODE_BLUETOOTH = 3
MODE_DESKTOP = 4

MODE_NAMES = {
    MODE_RACING: "Racing",
    MODE_INFO: "Info/Diagnostic",
    MODE_CARPLAY: "CarPlay",
    MODE_BLUETOOTH: "Bluetooth",
    MODE_DESKTOP: "Desktop"
}

# Engine parameters - warning thresholds
TEMP_WARNING = 100  # °C
TEMP_CRITICAL = 110  # °C
RPM_WARNING = 6500  # RPM
RPM_CRITICAL = 7000  # RPM

# Colors (RGB hex format)
COLOR_BLACK = "#000000"
COLOR_WHITE = "#FFFFFF"
COLOR_RED = "#FF0000"
COLOR_GREEN = "#00FF00"
COLOR_YELLOW = "#FFFF00"
COLOR_BLUE = "#0000FF"
COLOR_ORANGE = "#FF8800"

# UI sizes
GAUGE_MIN_VALUE = 0
GAUGE_RPM_MAX = 8000
GAUGE_SPEED_MAX = 200  # km/h
GAUGE_TEMP_MAX = 120  # °C
