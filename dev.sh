#!/bin/bash
# Development Mode - Run Vite dev server + FastAPI backend

echo "🚀 Starting Yaris Cockpit (Development Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install frontend dependencies
if [ ! -d "web_ui/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd web_ui
    npm install
    cd ..
fi

# Install backend dependencies
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    cd backend
    source venv/bin/activate
    cd ..
fi

# Start backend in background
echo "🔧 Starting FastAPI backend on http://localhost:8000"
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend dev server
echo "⚛️  Starting Vite dev server on http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open browser to: http://localhost:3000"
echo "📡 API endpoint: http://localhost:8000"
echo "🔌 WebSocket: ws://localhost:8000/ws"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd web_ui
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
