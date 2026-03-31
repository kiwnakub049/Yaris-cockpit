#!/bin/bash
# Cross-Platform Package Installation Helper
# For Linux/macOS/Raspberry Pi

echo "========================================"
echo " Yaris Cockpit - Package Installer"
echo "========================================"
echo ""

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python not found!"
    exit 1
fi

echo "[OK] Using: $PYTHON_CMD"
$PYTHON_CMD --version

# Check if running in project root
if [ ! -f "backend/requirements.txt" ]; then
    echo "[ERROR] Please run this script from the project root directory"
    exit 1
fi

# Install backend packages
echo ""
echo "Installing backend packages..."
cd backend

# Create virtual environment if not exists
if [ -d "venv" ]; then
    echo "[OK] Virtual environment found"
else
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install from requirements.txt
echo "Installing Python packages..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "[OK] Backend packages installed successfully"
else
    echo "[ERROR] Failed to install some packages"
    exit 1
fi

# List installed packages
echo ""
echo "Installed packages:"
pip list

deactivate
cd ..

# Install frontend packages
echo ""
echo "Installing frontend packages..."
cd web_ui

if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo "[OK] Frontend packages installed successfully"
    else
        echo "[ERROR] Failed to install frontend packages"
        exit 1
    fi
else
    echo "[WARNING] package.json not found, skipping frontend installation"
fi

cd ..

echo ""
echo "========================================"
echo " Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure OBD2 port in config/app_config.json"
echo "2. Run: ./start.sh (or ./dev.sh for development)"
echo ""
