#!/bin/bash

# Yaris Cockpit - Kiosk Mode Setup
# This script configures Raspberry Pi to boot directly to fullscreen browser

set -e

echo "======================================"
echo "Yaris Cockpit - Kiosk Mode Setup"
echo "======================================"

# Install required packages
echo "[1/5] Installing required packages..."
sudo apt-get update
sudo apt-get install -y chromium unclutter xdotool plymouth plymouth-themes

# Disable desktop manager (LightDM) auto-start to speed up boot
echo "[2/5] Configuring boot options..."
sudo systemctl set-default multi-user.target

# Create autostart directory
echo "[3/5] Creating autostart configuration..."
mkdir -p ~/.config/autostart
mkdir -p ~/.config/lxsession/LXDE-pi

# Create autostart script for kiosk mode
cat << 'EOF' > ~/.config/lxsession/LXDE-pi/autostart
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash

# Disable screen blanking
@xset s off
@xset -dpms
@xset s noblank

# Hide mouse cursor
@unclutter -idle 0.5 -root

# Wait for network and service
@bash -c "sleep 3"

# Start Chromium in kiosk mode
@chromium --noerrdialogs --disable-infobars --kiosk --disable-session-crashed-bubble --disable-features=TranslateUI --no-first-run --start-fullscreen --window-position=0,0 http://localhost:8080
EOF

# Create boot splash configuration
echo "[4/5] Setting up boot splash screen..."

# Create custom Plymouth theme directory
sudo mkdir -p /usr/share/plymouth/themes/yaris-cockpit

# Create Plymouth theme
cat << 'EOFPLYMOUTH' | sudo tee /usr/share/plymouth/themes/yaris-cockpit/yaris-cockpit.plymouth > /dev/null
[Plymouth Theme]
Name=Yaris Cockpit
Description=Yaris Cockpit Boot Screen
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/yaris-cockpit
ScriptFile=/usr/share/plymouth/themes/yaris-cockpit/yaris-cockpit.script
EOFPLYMOUTH

# Create simple black screen script
cat << 'EOFSCRIPT' | sudo tee /usr/share/plymouth/themes/yaris-cockpit/yaris-cockpit.script > /dev/null
# Simple black screen

Window.SetBackgroundTopColor(0, 0, 0);
Window.SetBackgroundBottomColor(0, 0, 0);

# Optional: Add YARIS text
message_sprite = Sprite();
message_sprite.SetPosition(Window.GetWidth() / 2 - 100, Window.GetHeight() / 2, 10000);

fun message_callback(text) {
    my_image = Image.Text(text, 1, 1, 1);
    message_sprite.SetImage(my_image);
}

Plymouth.SetMessageFunction(message_callback);
EOFSCRIPT

# Install the theme
echo "[5/5] Installing Plymouth theme..."
sudo plymouth-set-default-theme -R yaris-cockpit

# Configure cmdline.txt for faster boot
echo "Configuring boot parameters..."
sudo cp /boot/cmdline.txt /boot/cmdline.txt.backup

# Add splash and quiet to boot parameters
if ! grep -q "splash" /boot/cmdline.txt; then
    sudo sed -i 's/$/ splash quiet plymouth.ignore-serial-consoles logo.nologo vt.global_cursor_default=0/' /boot/cmdline.txt
fi

# Hide boot messages
cat << 'EOFCONFIG' | sudo tee -a /boot/config.txt > /dev/null

# Yaris Cockpit - Hide boot messages
disable_splash=0
EOFCONFIG

# Create systemd service to start X server and browser
cat << 'EOFSERVICE' | sudo tee /etc/systemd/system/yaris-kiosk.service > /dev/null
[Unit]
Description=Yaris Cockpit Kiosk Mode
After=network-online.target yaris-cockpit.service
Wants=network-online.target

[Service]
Type=simple
User=flick
Environment=DISPLAY=:0
ExecStartPre=/bin/sleep 5
ExecStart=/usr/bin/startx
Restart=on-failure
RestartSec=10

[Install]
WantedBy=graphical.target
EOFSERVICE

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable yaris-kiosk.service

echo ""
echo "======================================"
echo "Kiosk Mode Setup Complete! ✓"
echo "======================================"
echo ""
echo "Changes applied:"
echo "  ✓ Plymouth black splash screen"
echo "  ✓ Hidden boot messages"
echo "  ✓ Chromium kiosk mode autostart"
echo "  ✓ Hidden mouse cursor"
echo "  ✓ Disabled screen blanking"
echo ""
echo "To apply changes, reboot:"
echo "  sudo reboot"
echo ""
echo "To revert to normal desktop mode:"
echo "  sudo systemctl set-default graphical.target"
echo "  sudo systemctl disable yaris-kiosk.service"
echo ""
