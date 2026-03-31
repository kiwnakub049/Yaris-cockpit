#!/bin/bash

# Yaris 2014 Ultimate Cockpit - Raspberry Pi Setup Script
# This script configures Raspberry Pi OS for the dashboard application

set -e

echo "======================================"
echo "Yaris Cockpit - Raspberry Pi Setup"
echo "======================================"

# Update system
echo "[1/8] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Python dependencies
echo "[2/8] Installing Python development tools..."
sudo apt-get install -y python3-dev python3-pip python3-venv

# Install PyQt5 dependencies
echo "[3/8] Installing PyQt5 dependencies..."
sudo apt-get install -y qt5-qmake qt5-default libqt5gui5 libqt5core5a

# Install OBD2 and GPS tools
echo "[4/8] Installing OBD2 and GPS tools..."
sudo apt-get install -y gpsd gpsd-clients python3-gps

# Install Bluetooth tools
echo "[5/8] Installing Bluetooth tools..."
sudo apt-get install -y bluez bluez-tools pulseaudio pulseaudio-utils

# Install audio tools
echo "[6/8] Installing audio tools..."
sudo apt-get install -y alsa-utils

# Install other dependencies
echo "[7/8] Installing additional tools..."
sudo apt-get install -y usbutils udev git vim

# Setup udev rules for USB devices (auto-detection)
echo "[8/8] Setting up udev rules..."
cat << 'EOF' | sudo tee /etc/udev/rules.d/99-yaris-cockpit.rules > /dev/null
# OBD2 Scanner (ELM327)
SUBSYSTEM=="tty", ATTRS{idVendor}=="067b", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="067b", MODE="0666"

# Generic USB Serial Device
SUBSYSTEM=="tty", KERNEL=="ttyUSB*", MODE="0666"

# GPS Module
SUBSYSTEM=="tty", ATTRS{idProduct}=="6001", MODE="0666"
EOF

sudo udevadm control --reload-rules
sudo udevadm trigger

# Create virtual environment
echo ""
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo "Installing Python packages..."
pip install -r requirements.txt

# Configure display settings (optional)
echo ""
echo "======================================"
echo "Display Configuration"
echo "======================================"
echo "To set custom resolution, edit /boot/config.txt"
echo "Example for 7\" display:"
echo "  hdmi_cvt=1024 600 60 6 0 0 0"
echo "  hdmi_group=2"
echo "  hdmi_mode=87"
echo ""

# Auto-login setup (optional)
echo "======================================"
echo "Auto-Login Setup"
echo "======================================"
echo "To enable auto-login, run:"
echo "  sudo raspi-config"
echo "  -> System Options -> Boot / Auto Login -> Desktop Auto-login"
echo ""

# Enable services
echo "Enabling system services..."
sudo systemctl enable bluetooth
sudo systemctl enable gpsd

echo ""
echo "======================================"
echo "Setup Complete! ✓"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure display: sudo nano /boot/config.txt"
echo "2. Set up auto-login: sudo raspi-config"
echo "3. Connect OBD2 scanner via USB"
echo "4. Start application: python3 src/main.py"
echo ""
