#!/bin/bash
# Yaris Cockpit Demo Runner
# Supports Linux, macOS, Windows (WSL), and Android (Termux)

echo "🚗 Yaris Cockpit Demo Mode"
echo "=========================="

# Detect platform
if [ -n "$TERMUX_VERSION" ]; then
    PLATFORM="Android (Termux)"
    echo "📱 Running on $PLATFORM"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f "/proc/version" ] && grep -q "Microsoft" /proc/version; then
        PLATFORM="Windows (WSL)"
    else
        PLATFORM="Linux"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
else
    PLATFORM="Unknown"
fi
echo "🖥️  Platform: $PLATFORM"

# Check if Python is installed
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    if [ "$PLATFORM" = "Android (Termux)" ]; then
        echo "   Run: pkg install python"
    fi
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    if [ "$PLATFORM" = "Android (Termux)" ]; then
        echo "   Run: pkg install nodejs"
    fi
    exit 1
fi

# Function to check if port is in use
check_port() {
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "❌ Port $1 is already in use"
            return 1
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$1 "; then
            echo "❌ Port $1 is already in use"
            return 1
        fi
    fi
    return 0
}

# Check ports
echo "🔍 Checking ports..."
if ! check_port 8000; then
    echo "   Backend port 8000 is busy. Please free it or change port in main_demo.py"
    exit 1
fi

if ! check_port 3000; then
    echo "   Frontend port 3000 is busy. Please free it or change port in web_ui/vite.config.ts"
    exit 1
fi

echo "✅ Ports are available"

# Install Python dependencies if requirements_demo.txt exists
if [ -f "requirements_demo.txt" ]; then
    echo "📦 Installing Python dependencies..."
    if [ "$PLATFORM" = "Android (Termux)" ]; then
        # On Termux, use pip with --user if needed
        $PYTHON_CMD -m pip install --user -r requirements_demo.txt 2>/dev/null || $PYTHON_CMD -m pip install -r requirements_demo.txt
    else
        $PYTHON_CMD -m pip install -r requirements_demo.txt
    fi
fi

# Install Node.js dependencies and build frontend
if [ -d "web_ui" ]; then
    echo "📦 Installing Node.js dependencies..."
    cd web_ui
    npm install

    echo "🔨 Building frontend..."
    npm run build
    cd ..
fi

echo ""
echo "🚀 Starting Yaris Cockpit Demo..."
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    if [ ! -z "$backend_pid" ]; then
        kill $backend_pid 2>/dev/null
    fi
    if [ ! -z "$frontend_pid" ]; then
        kill $frontend_pid 2>/dev/null
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend server (Demo Mode)..."
$PYTHON_CMD backend/main_demo.py &
backend_pid=$!

# Wait a bit for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $backend_pid 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend running on http://localhost:8000"

# Start frontend dev server in background (optional)
if [ -d "web_ui" ]; then
    echo "🎨 Starting frontend dev server..."
    cd web_ui
    npm run dev &
    frontend_pid=$!
    cd ..

    # Wait a bit for frontend to start
    sleep 5

    echo "✅ Frontend dev server on http://localhost:3000"
    echo "✅ Production build served on http://localhost:8000"
else
    echo "ℹ️  No web_ui directory found, running backend only"
fi

echo ""
echo "🎉 Yaris Cockpit Demo is running!"
if [ "$PLATFORM" = "Android (Termux)" ]; then
    echo "   📱 Open Chrome/Samsung Internet on Android:"
    echo "      http://localhost:3000 (dev mode)"
    echo "      http://localhost:8000 (production)"
    echo "   💡 Or access from another device on same network:"
    echo "      http://[android-ip]:3000"
else
    echo "   📱 Open http://localhost:3000 in your browser (dev mode)"
    echo "   🌐 Or http://localhost:8000 for production build"
fi
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
    echo "   Frontend port 3000 is busy. Please free it or change port"
    exit 1
fi

echo "✅ Ports are available"

# Install Python dependencies if needed
echo "📦 Installing Python dependencies..."
pip install -r requirements_demo.txt

# Start backend in background
echo "🚀 Starting backend server..."
python backend/main_demo.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend started (PID: $BACKEND_PID)"

# Go to web_ui directory
cd web_ui

# Install Node.js dependencies if needed
echo "📦 Installing Node.js dependencies..."
npm install

# Start frontend development server
echo "🚀 Starting frontend development server..."
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Demo mode is running!"
echo "📱 Open your Android browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "🛑 To stop: Press Ctrl+C or run 'kill $BACKEND_PID $FRONTEND_PID'"

# Wait for user interrupt
trap "echo '🛑 Stopping demo...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep running
wait