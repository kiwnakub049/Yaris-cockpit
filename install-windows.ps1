# Yaris Cockpit - Windows Installation Script
# Automatically installs all required dependencies
# Run as Administrator: powershell -ExecutionPolicy Bypass -File install-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Yaris Cockpit - Windows Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[WARNING] Not running as Administrator" -ForegroundColor Yellow
    Write-Host "Some features may require Administrator privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Check Chocolatey
Write-Host "Checking package managers..." -ForegroundColor Cyan
try {
    choco --version | Out-Null
    Write-Host "[OK] Chocolatey found" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Chocolatey not found. Installing..." -ForegroundColor Yellow
    Write-Host "Visit https://chocolatey.org/install for manual installation" -ForegroundColor Yellow
    Write-Host ""
}

# Check Node.js
Write-Host ""
Write-Host "Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js manually:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Choose LTS version (v20 recommended)" -ForegroundColor White
    Write-Host "3. Run installer and follow instructions" -ForegroundColor White
    Write-Host "4. Restart PowerShell after installation" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install via Chocolatey (if installed):" -ForegroundColor Yellow
    Write-Host "  choco install nodejs-lts -y" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

# Check Python
Write-Host ""
Write-Host "Checking Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version
    Write-Host "[OK] Python $pythonVersion installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python manually:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "2. Choose Python 3.10 or higher" -ForegroundColor White
    Write-Host "3. IMPORTANT: Check 'Add Python to PATH' during installation" -ForegroundColor Red
    Write-Host "4. Restart PowerShell after installation" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install via Chocolatey (if installed):" -ForegroundColor Yellow
    Write-Host "  choco install python -y" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

# Install Frontend Dependencies
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location web_ui

if (Test-Path "package.json") {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] package.json not found!" -ForegroundColor Red
}

Set-Location ..

# Install Backend Dependencies
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location backend

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Virtual environment created" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create virtual environment" -ForegroundColor Red
    }
}

# Activate and install packages
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
    
    Write-Host "Installing Python packages..." -ForegroundColor Yellow
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
    }
    
    deactivate
}

Set-Location ..

# Create desktop shortcut (optional)
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Optional: Desktop Shortcut" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$createShortcut = Read-Host "Create desktop shortcut? (Y/N)"

if ($createShortcut -eq "Y" -or $createShortcut -eq "y") {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Yaris Cockpit.lnk")
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$PSScriptRoot\start.ps1`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Yaris Cockpit 2.0 - Car Dashboard System"
    $Shortcut.Save()
    Write-Host "[OK] Desktop shortcut created" -ForegroundColor Green
}

# Installation complete
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start Yaris Cockpit:" -ForegroundColor Cyan
Write-Host "1. Run: .\start.ps1" -ForegroundColor White
Write-Host "   or" -ForegroundColor Gray
Write-Host "2. Run: .\start.bat" -ForegroundColor White
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "http://localhost:8000" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
