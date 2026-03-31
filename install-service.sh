#!/bin/bash
# Install Yaris Cockpit as systemd service for auto-start

echo "🔧 Installing Yaris Cockpit Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy service file to systemd
sudo cp yaris-cockpit.service /etc/systemd/system/

# Reload systemd
echo "📦 Reloading systemd..."
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
echo "✅ Enabling auto-start..."
sudo systemctl enable yaris-cockpit.service

# Start service now
echo "🚀 Starting service..."
sudo systemctl start yaris-cockpit.service

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo ""
echo "📋 Useful commands:"
echo "  sudo systemctl status yaris-cockpit    # Check status"
echo "  sudo systemctl stop yaris-cockpit      # Stop service"
echo "  sudo systemctl restart yaris-cockpit   # Restart"
echo "  sudo systemctl disable yaris-cockpit   # Disable auto-start"
echo "  journalctl -u yaris-cockpit -f         # View logs"
echo ""
echo "🔄 Reboot to test auto-start: sudo reboot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
