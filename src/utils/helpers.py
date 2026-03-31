#!/usr/bin/env python3
"""
Helper Functions
Utility functions for common operations
"""

import math

def convert_celsius_to_fahrenheit(celsius):
    """Convert temperature from Celsius to Fahrenheit"""
    return (celsius * 9/5) + 32

def convert_kmh_to_mph(kmh):
    """Convert speed from km/h to mph"""
    return kmh * 0.621371

def convert_ms_to_kmh(ms):
    """Convert speed from m/s to km/h"""
    return ms * 3.6

def normalize_angle(angle):
    """Normalize angle to 0-360 range"""
    return angle % 360

def clamp_value(value, min_val, max_val):
    """Clamp value between min and max"""
    return max(min_val, min(max_val, value))

def lerp(a, b, t):
    """Linear interpolation between two values"""
    return a + (b - a) * t

def smoothstep(t):
    """Smooth step interpolation (easing function)"""
    return t * t * (3 - 2 * t)

def format_time(seconds):
    """Format time in seconds to HH:MM:SS"""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{int(hours):02d}:{int(minutes):02d}:{int(secs):02d}"

def format_speed(speed, unit='kmh'):
    """Format speed with unit"""
    if unit == 'kmh':
        return f"{int(speed)} km/h"
    elif unit == 'mph':
        return f"{int(speed)} mph"
    else:
        return f"{speed:.1f}"

def format_temperature(temp, unit='C'):
    """Format temperature with unit"""
    if unit == 'C':
        return f"{int(temp)}°C"
    elif unit == 'F':
        return f"{int(temp)}°F"
    else:
        return f"{temp:.1f}"
