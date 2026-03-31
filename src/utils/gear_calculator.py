#!/usr/bin/env python3
"""
gear_calculator.py
Intelligent Gear Detection for Toyota Yaris

Estimates current gear based on RPM/Speed ratio and vehicle characteristics.
Supports both manual and CVT/automatic transmissions.

Author: Senior Automotive Software Engineer
Vehicle: 2014 Toyota Yaris (CVT/Manual)
"""

from typing import Optional, Tuple
from enum import Enum


class GearType(Enum):
    """Possible gear states"""
    NEUTRAL = 0
    REVERSE = -1
    PARK = -2
    GEAR_1 = 1
    GEAR_2 = 2
    GEAR_3 = 3
    GEAR_4 = 4
    GEAR_5 = 5
    GEAR_6 = 6
    DRIVE = 7  # CVT in normal D mode


class YarisGearCalculator:
    """
    Gear detection for 2014 Toyota Yaris
    
    Supports:
    - 5-speed Manual (1NZ-FE)
    - CVT (3NR-FE) with simulated 7-speed
    
    Technical Specs:
    - Tire Size: 175/65R15 (default)
    - Final Drive Ratio: 4.312 (Manual), 5.247 (CVT)
    - Wheel Circumference: 1.96 meters
    """
    
    # Gear ratios for Manual transmission
    MANUAL_RATIOS = {
        1: 3.166,
        2: 1.904,
        3: 1.392,
        4: 1.031,
        5: 0.815,
    }
    
    # CVT simulated gear ratios (approximate)
    CVT_RATIOS = {
        1: 2.200,
        2: 1.650,
        3: 1.300,
        4: 1.050,
        5: 0.900,
        6: 0.750,
        7: 0.650,
    }
    
    # Final drive ratios
    FINAL_DRIVE_MANUAL = 4.312
    FINAL_DRIVE_CVT = 5.247
    
    # Tire specifications (175/65R15)
    TIRE_DIAMETER_MM = 584  # millimeters
    WHEEL_CIRCUMFERENCE_M = 1.96  # meters (π × diameter)
    
    def __init__(self, transmission_type: str = "cvt", tire_size: str = "175/65R15"):
        """
        Initialize gear calculator
        
        Args:
            transmission_type: "manual" or "cvt"
            tire_size: Tire size string (e.g., "175/65R15")
        """
        self.transmission_type = transmission_type.lower()
        
        if self.transmission_type == "manual":
            self.gear_ratios = self.MANUAL_RATIOS
            self.final_drive = self.FINAL_DRIVE_MANUAL
        else:  # CVT
            self.gear_ratios = self.CVT_RATIOS
            self.final_drive = self.FINAL_DRIVE_CVT
        
        # Parse tire size if different
        self.wheel_circumference = self.WHEEL_CIRCUMFERENCE_M
        
        # Calibration tolerance (±15%)
        self.tolerance = 0.15
        
        # Moving average buffer for stability
        self.gear_history = []
        self.history_size = 3
    
    def calculate_theoretical_rpm(self, speed_kmh: float, gear: int) -> float:
        """
        Calculate theoretical RPM for a given speed and gear
        
        Formula:
        RPM = (Speed × Gear_Ratio × Final_Drive × 60) / (Wheel_Circumference × 3.6)
        
        Args:
            speed_kmh: Vehicle speed in km/h
            gear: Gear number (1-5 for manual, 1-7 for CVT)
            
        Returns:
            float: Theoretical RPM
        """
        if speed_kmh < 1:
            return 0.0
        
        # Get gear ratio
        gear_ratio = self.gear_ratios.get(gear, 1.0)
        
        # Convert km/h to m/s
        speed_ms = speed_kmh / 3.6
        
        # Calculate wheel RPM
        wheel_rpm = (speed_ms * 60) / self.wheel_circumference
        
        # Calculate engine RPM
        engine_rpm = wheel_rpm * gear_ratio * self.final_drive
        
        return engine_rpm
    
    def detect_gear(self, rpm: float, speed_kmh: float) -> Tuple[GearType, float]:
        """
        Detect current gear based on RPM and speed
        
        Args:
            rpm: Engine RPM
            speed_kmh: Vehicle speed in km/h
            
        Returns:
            Tuple[GearType, float]: (detected gear, confidence 0-1)
        """
        # Edge cases
        if rpm < 500:
            return GearType.NEUTRAL, 1.0
        
        if speed_kmh < 1:
            if rpm > 700:
                return GearType.NEUTRAL, 0.9
            else:
                return GearType.PARK, 0.8
        
        # For very low speeds, assume 1st gear
        if speed_kmh < 5:
            return GearType.GEAR_1, 0.7
        
        # Calculate ratio for each gear
        best_gear = None
        best_diff = float('inf')
        
        for gear_num, _ in self.gear_ratios.items():
            theoretical_rpm = self.calculate_theoretical_rpm(speed_kmh, gear_num)
            
            # Calculate difference percentage
            diff = abs(rpm - theoretical_rpm) / rpm if rpm > 0 else float('inf')
            
            if diff < best_diff:
                best_diff = diff
                best_gear = gear_num
        
        # Confidence based on how close we are
        confidence = max(0.0, 1.0 - (best_diff / self.tolerance))
        
        # Map to GearType enum
        if best_gear is None:
            return GearType.NEUTRAL, 0.0
        
        if self.transmission_type == "cvt" and best_gear >= 7:
            gear_type = GearType.DRIVE
        else:
            gear_type = GearType(best_gear)
        
        # Apply moving average for stability
        self.gear_history.append(gear_type)
        if len(self.gear_history) > self.history_size:
            self.gear_history.pop(0)
        
        # Use most common gear in history
        if len(self.gear_history) >= 2:
            most_common = max(set(self.gear_history), key=self.gear_history.count)
            return most_common, confidence
        
        return gear_type, confidence
    
    def detect_reverse(self, speed_kmh: float, accel_position: float) -> bool:
        """
        Detect if vehicle is in reverse
        
        This is difficult without direct gear position sensor.
        Heuristics:
        - Low speed
        - Throttle applied
        - No forward acceleration
        
        Args:
            speed_kmh: Current speed
            accel_position: Accelerator position (0-100%)
            
        Returns:
            bool: True if likely in reverse
        """
        # This requires additional sensors (GPS, accelerometer)
        # For now, return False - implement when hardware available
        return False
    
    def get_gear_display_string(self, gear_type: GearType) -> str:
        """
        Get user-friendly gear display string
        
        Args:
            gear_type: GearType enum
            
        Returns:
            str: Display string (e.g., "3", "D", "N", "R")
        """
        if gear_type == GearType.NEUTRAL:
            return "N"
        elif gear_type == GearType.REVERSE:
            return "R"
        elif gear_type == GearType.PARK:
            return "P"
        elif gear_type == GearType.DRIVE:
            return "D"
        else:
            return str(gear_type.value)
    
    def get_shift_recommendation(self, rpm: float, current_gear: GearType) -> Optional[str]:
        """
        Recommend upshift/downshift for optimal performance
        
        Rules:
        - Upshift at 6000 RPM (near redline)
        - Downshift below 2000 RPM (too low for power)
        
        Args:
            rpm: Current RPM
            current_gear: Current gear
            
        Returns:
            Optional[str]: "UP", "DOWN", or None
        """
        if rpm >= 6000 and current_gear.value < 5:
            return "UP"
        elif rpm < 2000 and current_gear.value > 1:
            return "DOWN"
        else:
            return None


# ============================================================================
# TESTING & CALIBRATION
# ============================================================================

if __name__ == "__main__":
    """
    Test gear detection with sample data
    """
    print("=" * 60)
    print("Yaris Gear Calculator - Test Suite")
    print("=" * 60)
    
    # Test scenarios for CVT
    calc_cvt = YarisGearCalculator(transmission_type="cvt")
    
    test_cases = [
        # (RPM, Speed km/h, Expected Gear)
        (800, 0, "N or P"),
        (2000, 15, "1st"),
        (3000, 30, "2nd"),
        (3500, 50, "3rd"),
        (4000, 70, "4th"),
        (4500, 90, "5th"),
        (5000, 110, "6th or D"),
    ]
    
    print("\nCVT Transmission Tests:")
    print("-" * 60)
    print(f"{'RPM':<8} {'Speed':<10} {'Detected':<12} {'Confidence':<12} {'Expected'}")
    print("-" * 60)
    
    for rpm, speed, expected in test_cases:
        gear, confidence = calc_cvt.detect_gear(rpm, speed)
        gear_str = calc_cvt.get_gear_display_string(gear)
        print(f"{rpm:<8} {speed:<10} {gear_str:<12} {confidence:.2%}         {expected}")
    
    # Test manual transmission
    calc_manual = YarisGearCalculator(transmission_type="manual")
    
    print("\n\nManual Transmission Tests:")
    print("-" * 60)
    print(f"{'RPM':<8} {'Speed':<10} {'Detected':<12} {'Confidence':<12}")
    print("-" * 60)
    
    manual_tests = [
        (3000, 20),
        (3500, 40),
        (4000, 60),
        (4500, 80),
        (5000, 100),
    ]
    
    for rpm, speed in manual_tests:
        gear, confidence = calc_manual.detect_gear(rpm, speed)
        gear_str = calc_manual.get_gear_display_string(gear)
        shift_rec = calc_manual.get_shift_recommendation(rpm, gear)
        shift_str = f"→ {shift_rec}" if shift_rec else ""
        print(f"{rpm:<8} {speed:<10} {gear_str:<12} {confidence:.2%}  {shift_str}")
    
    print("\n" + "=" * 60)
    print("Calibration Tips:")
    print("- Adjust tolerance if detection is unstable")
    print("- Record actual RPM/Speed pairs for your vehicle")
    print("- Fine-tune gear ratios based on real data")
    print("=" * 60)
