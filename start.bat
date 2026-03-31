@echo off
REM Yaris Cockpit - Windows Production Mode
REM Auto-install dependencies and start the application

echo ========================================
echo    Yaris Cockpit 2.0 - Windows Mode
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    echo Recommended: v18 or v20 LTS
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found!
    echo Please install Python from https://www.python.org/
    echo Recommended: Python 3.10 or higher
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo [OK] Python found: 
python --version
echo.

REM Install frontend dependencies
echo ========================================
echo  Installing Frontend Dependencies
echo ========================================
cd web_ui
if not exist "node_modules\" (
    echo Installing npm packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Frontend dependencies already installed
)

REM Build frontend
echo.
echo ========================================
echo  Building Frontend
echo ========================================
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
cd ..

REM Install backend dependencies
echo.
echo ========================================
echo  Installing Backend Dependencies
echo ========================================
cd backend
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python packages...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

REM Start backend server
echo.
echo ========================================
echo  Starting Backend Server
echo ========================================
echo Backend will start on http://localhost:8000
echo Press Ctrl+C to stop
echo.

python main.py

REM Cleanup on exit
deactivate
cd ..
pause
