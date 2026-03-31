#!/bin/bash
# Yaris Cockpit - Complete uninstall script

echo "======================================"
echo "Yaris Cockpit - Uninstall"
echo "======================================"
echo ""
echo "This script will remove the Yaris Cockpit application"
echo "Your configuration will be backed up."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Backup configuration
echo "Backing up configuration..."
BACKUP_DIR="$HOME/yaris-cockpit-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r config/ "$BACKUP_DIR/" 2>/dev/null
echo "✓ Backup saved to: $BACKUP_DIR"

# Stop service if running
echo "Stopping service..."
sudo systemctl stop yaris-cockpit 2>/dev/null
sudo systemctl disable yaris-cockpit 2>/dev/null
sudo rm /etc/systemd/system/yaris-cockpit.service 2>/dev/null

# Remove autostart entry
rm ~/.config/autostart/yaris-cockpit.desktop 2>/dev/null

# Remove application
echo "Removing application files..."
rm -rf venv/
rm -f logs/*

echo ""
echo "======================================"
echo "Uninstall complete!"
echo "======================================"
echo ""
echo "Your backup is at: $BACKUP_DIR"
echo "To fully remove, delete: ~/yaris-cockpit"
echo ""
