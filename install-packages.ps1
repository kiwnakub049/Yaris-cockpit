# Cross-Platform Package Installation Helper
# Auto-detects OS and installs required packages

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Yaris Cockpit - Package Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detect Python command (python or python3)
$pythonCmd = "python"
try {
    & $pythonCmd --version 2>&1 | Out-Null
} catch {
    $pythonCmd = "python3"
    try {
        & $pythonCmd --version 2>&1 | Out-Null
    } catch {
        Write-Host "[ERROR] Python not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[OK] Using: $pythonCmd" -ForegroundColor Green
& $pythonCmd --version

# Check if running in project root
if (-not (Test-Path "backend/requirements.txt")) {
    Write-Host "[ERROR] Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Install backend packages
Write-Host ""
Write-Host "Installing backend packages..." -ForegroundColor Yellow
cd backend

# Check if venv exists
if (Test-Path "venv") {
    Write-Host "[OK] Virtual environment found" -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    & $pythonCmd -m venv venv
    & "venv\Scripts\Activate.ps1"
}

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
& $pythonCmd -m pip install --upgrade pip

# Install from requirements.txt
Write-Host "Installing Python packages..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend packages installed successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install some packages" -ForegroundColor Red
}

# List installed packages
Write-Host ""
Write-Host "Installed packages:" -ForegroundColor Cyan
pip list

deactivate
cd ..

# Install frontend packages
Write-Host ""
Write-Host "Installing frontend packages..." -ForegroundColor Yellow
cd web_ui

if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Frontend packages installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to install frontend packages" -ForegroundColor Red
    }
} else {
    Write-Host "[WARNING] package.json not found, skipping frontend installation" -ForegroundColor Yellow
}

cd ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure OBD2 port in config/app_config.json" -ForegroundColor White
Write-Host "2. Run: .\start.ps1" -ForegroundColor White
Write-Host ""
