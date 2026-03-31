#!/usr/bin/env python3
"""
custom_toyota_pids.py
Custom OBD2 PID Definitions for Toyota Vehicles

This module defines Toyota-specific PIDs (Mode 21) that are not part of
standard OBD2 protocol, particularly for accessing transmission data.

Author: Senior Automotive Software Engineer
Vehicle: 2014 Toyota Yaris
"""

import obd
from obd import OBDCommand, Unit
from obd.protocols import ECU
from obd.utils import bytes_to_int


def atf_temp_decoder(messages):
    """
    Decode ATF (Automatic Transmission Fluid) Temperature
    
    Toyota CVT/Auto transmissions report ATF temp via Mode 21, PID 82
    on the Transmission Control Module (TCM) at header 7E1.
    
    Formula: ((A*256) + B) / 256 - 40
    Where:
        A = First data byte
        B = Second data byte
    
    Args:
        messages: OBD response messages
        
    Returns:
        pint.Quantity: Temperature in Celsius
    """
    if not messages or len(messages) < 1:
        return None
    
    data = messages[0].data
    
    # Need at least 2 bytes after mode/PID
    if len(data) < 4:  # [Mode, PID, A, B]
        return None
    
    # Extract data bytes (skip mode and PID)
    byte_a = data[2]
    byte_b = data[3]
    
    # Apply Toyota's equation
    temp_celsius = ((byte_a * 256) + byte_b) / 256.0 - 40.0
    
    return temp_celsius * Unit.celsius


def accelerator_position_decoder(messages):
    """
    Decode Accelerator Pedal Position
    
    More accurate than standard PID 0x49 on some Toyota models.
    Formula: A / 2.55 (to get percentage)
    
    Args:
        messages: OBD response messages
        
    Returns:
        pint.Quantity: Percentage (0-100%)
    """
    if not messages or len(messages) < 1:
        return None
    
    data = messages[0].data
    
    if len(data) < 3:
        return None
    
    byte_a = data[2]
    percentage = byte_a / 2.55
    
    return percentage * Unit.percent


def target_idle_rpm_decoder(messages):
    """
    Decode Target Idle RPM
    
    Useful for diagnosing idle control issues.
    Formula: (A * 256) + B
    
    Args:
        messages: OBD response messages
        
    Returns:
        pint.Quantity: RPM value
    """
    if not messages or len(messages) < 1:
        return None
    
    data = messages[0].data
    
    if len(data) < 4:
        return None
    
    byte_a = data[2]
    byte_b = data[3]
    
    rpm = (byte_a * 256) + byte_b
    
    return rpm * Unit.rpm


# ============================================================================
# CUSTOM COMMAND DEFINITIONS
# ============================================================================

# ATF Temperature (Transmission Fluid)
# Header: 7E1 (Transmission ECU)
# Mode: 21 (Toyota Custom)
# PID: 82
ATF_TEMP = OBDCommand(
    name="ATF_TEMP",
    desc="Automatic Transmission Fluid Temperature",
    command=b"2182",  # Mode 21, PID 82
    _bytes=4,  # Expected response length
    decoder=atf_temp_decoder,
    ecu=ECU.ALL,  # Try all ECUs (will use header 7E1)
    fast=False
)

# Accelerator Position (Alternative to standard PID)
# Header: 7E0 (Engine ECU)
# Mode: 21
# PID: 01
ACCEL_POSITION_CUSTOM = OBDCommand(
    name="ACCEL_POSITION_CUSTOM",
    desc="Accelerator Pedal Position (Custom)",
    command=b"2101",
    _bytes=3,
    decoder=accelerator_position_decoder,
    ecu=ECU.ENGINE,
    fast=True
)

# Target Idle RPM
# Header: 7E0 (Engine ECU)
# Mode: 21
# PID: 1C
TARGET_IDLE_RPM = OBDCommand(
    name="TARGET_IDLE_RPM",
    desc="Target Idle RPM",
    command=b"211C",
    _bytes=4,
    decoder=target_idle_rpm_decoder,
    ecu=ECU.ENGINE,
    fast=False
)


def register_custom_commands(connection):
    """
    Register all custom Toyota PIDs with an OBD connection.
    
    This must be called AFTER connection.connect() but BEFORE queries.
    
    Args:
        connection: obd.OBD or obd.Async connection object
        
    Returns:
        bool: True if registration successful
        
    Example:
        >>> import obd
        >>> conn = obd.OBD()
        >>> register_custom_commands(conn)
        >>> response = conn.query(ATF_TEMP)
    """
    try:
        # Switch to Transmission ECU header for ATF temp
        # This is critical for Toyota vehicles
        connection.supported_commands.add(ATF_TEMP)
        
        # Register other custom commands
        connection.supported_commands.add(ACCEL_POSITION_CUSTOM)
        connection.supported_commands.add(TARGET_IDLE_RPM)
        
        print("[Toyota PIDs] Custom commands registered successfully")
        print(f"  ✓ ATF_TEMP (Header 7E1)")
        print(f"  ✓ ACCEL_POSITION_CUSTOM (Header 7E0)")
        print(f"  ✓ TARGET_IDLE_RPM (Header 7E0)")
        
        return True
        
    except Exception as e:
        print(f"[Toyota PIDs] Error registering custom commands: {e}")
        return False


def query_with_header(connection, command, header):
    """
    Query a custom PID with a specific ECU header.
    
    This is necessary for Toyota's multi-ECU architecture where
    transmission data requires switching to header 7E1.
    
    Args:
        connection: OBD connection object
        command: OBDCommand to query
        header: ECU header (e.g., "7E1" for transmission)
        
    Returns:
        OBDResponse object
        
    Example:
        >>> response = query_with_header(conn, ATF_TEMP, "7E1")
        >>> if not response.is_null():
        >>>     print(f"ATF Temp: {response.value}")
    """
    try:
        # Store original header
        original_header = connection.protocol.ecu_map.get(ECU.ALL)
        
        # Switch to custom header
        connection.send_command(f"ATSH{header}")
        
        # Query the command
        response = connection.query(command)
        
        # Restore original header
        if original_header:
            connection.send_command(f"ATSH{original_header}")
        
        return response
        
    except Exception as e:
        print(f"[Header Query] Error: {e}")
        return obd.OBDResponse()


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    """
    Test script to verify custom Toyota PIDs
    """
    import time
    
    print("=" * 60)
    print("Toyota Custom PID Test")
    print("Vehicle: 2014 Toyota Yaris")
    print("=" * 60)
    
    # Connect to OBD
    print("\n[1] Connecting to OBD adapter...")
    connection = obd.OBD()  # Auto-connect to /dev/ttyUSB0
    
    if not connection.is_connected():
        print("❌ Failed to connect to OBD adapter")
        print("   Check:")
        print("   - USB cable connection")
        print("   - Ignition is ON")
        print("   - /dev/ttyUSB0 permissions")
        exit(1)
    
    print(f"✓ Connected via {connection.protocol_name()}")
    print(f"✓ ECU: {connection.ecus}")
    
    # Register custom commands
    print("\n[2] Registering custom Toyota PIDs...")
    if not register_custom_commands(connection):
        print("❌ Failed to register custom commands")
        exit(1)
    
    # Test ATF Temperature
    print("\n[3] Testing ATF Temperature (Mode 21, PID 82)...")
    print("    Switching to header 7E1 (Transmission ECU)...")
    
    atf_response = query_with_header(connection, ATF_TEMP, "7E1")
    
    if not atf_response.is_null():
        print(f"✓ ATF Temperature: {atf_response.value}")
        
        # Safety check
        temp_c = atf_response.value.magnitude
        if temp_c > 110:
            print(f"⚠️  WARNING: High ATF temperature! ({temp_c}°C)")
        elif temp_c > 100:
            print(f"⚠️  CAUTION: ATF temperature elevated ({temp_c}°C)")
        else:
            print(f"✓ ATF temperature normal ({temp_c}°C)")
    else:
        print("❌ No response from Transmission ECU")
        print("   Try alternative headers: 7E8, 7E9")
    
    # Test other custom PIDs
    print("\n[4] Testing other custom PIDs...")
    
    accel_response = connection.query(ACCEL_POSITION_CUSTOM)
    if not accel_response.is_null():
        print(f"✓ Accelerator Position: {accel_response.value}")
    
    idle_response = connection.query(TARGET_IDLE_RPM)
    if not idle_response.is_null():
        print(f"✓ Target Idle RPM: {idle_response.value}")
    
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)
