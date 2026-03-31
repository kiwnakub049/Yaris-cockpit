# Yaris Cockpit Demo Runner for Windows
# This script starts both backend and frontend for demo mode

param(
    [switch]$NoFrontend,
    [switch]$NoBackend
)

Write-Host "🚗 Yaris Cockpit Demo Mode" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Check if Python is installed
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "❌ Python is not installed. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

# Check ports
Write-Host "🔍 Checking ports..." -ForegroundColor Yellow
if (Test-Port 8000) {
    Write-Host "❌ Port 8000 is already in use" -ForegroundColor Red
    Write-Host "   Backend port 8000 is busy. Please free it or change port in main_demo.py" -ForegroundColor Red
    exit 1
}

if (Test-Port 3000) {
    Write-Host "❌ Port 3000 is already in use" -ForegroundColor Red
    Write-Host "   Frontend port 3000 is busy. Please free it or change port in web_ui/vite.config.ts" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Ports are available" -ForegroundColor Green

# Install Python dependencies if requirements_demo.txt exists
if (Test-Path "requirements_demo.txt") {
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
    & $pythonCmd -m pip install -r requirements_demo.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
        exit 1
    }
}

# Install Node.js dependencies and build frontend
if ((Test-Path "web_ui") -and !$NoFrontend) {
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
    Push-Location web_ui
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build frontend" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Host "" -ForegroundColor White
Write-Host "🚀 Starting Yaris Cockpit Demo..." -ForegroundColor Green
Write-Host "" -ForegroundColor White

# Start backend
$backendJob = $null
if (!$NoBackend) {
    Write-Host "🔧 Starting backend server (Demo Mode)..." -ForegroundColor Yellow
    $backendJob = Start-Job -ScriptBlock {
        param($pythonCmd, $scriptPath)
        & $pythonCmd $scriptPath
    } -ArgumentList $pythonCmd, "backend/main_demo.py"
    Start-Sleep -Seconds 3

    # Check if backend is still running
    if ($backendJob.State -ne "Running") {
        Write-Host "❌ Backend failed to start" -ForegroundColor Red
        $backendJob | Stop-Job
        $backendJob | Remove-Job
        exit 1
    }

    Write-Host "✅ Backend running on http://localhost:8000" -ForegroundColor Green
}

# Start frontend dev server
$frontendJob = $null
if ((Test-Path "web_ui") -and !$NoFrontend) {
    Write-Host "🎨 Starting frontend dev server..." -ForegroundColor Yellow
    Push-Location web_ui
    $frontendJob = Start-Job -ScriptBlock {
        & npm run dev
    }
    Pop-Location

    Start-Sleep -Seconds 5

    Write-Host "✅ Frontend dev server on http://localhost:3000" -ForegroundColor Green
    Write-Host "✅ Production build served on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No web_ui directory found or -NoFrontend specified, running backend only" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 Yaris Cockpit Demo is running!" -ForegroundColor Green
Write-Host "   📱 Open http://localhost:3000 in your browser (dev mode)" -ForegroundColor White
Write-Host "   🌐 Or http://localhost:8000 for production build" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "💡 Press Ctrl+C to stop all services" -ForegroundColor White

# Wait for user interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 1

        # Check if jobs are still running
        if ($backendJob -and $backendJob.State -ne "Running") {
            Write-Host "❌ Backend job stopped unexpectedly" -ForegroundColor Red
            break
        }
        if ($frontendJob -and $frontendJob.State -ne "Running") {
            Write-Host "❌ Frontend job stopped unexpectedly" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "" -ForegroundColor White
    Write-Host "🛑 Shutting down..." -ForegroundColor Yellow

    if ($backendJob) {
        $backendJob | Stop-Job
        $backendJob | Remove-Job
    }
    if ($frontendJob) {
        $frontendJob | Stop-Job
        $frontendJob | Remove-Job
    }
}