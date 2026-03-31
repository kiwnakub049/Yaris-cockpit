#!/bin/bash
# Production Mode - Build and run with Chromium Kiosk

echo "🏭 Starting Yaris Cockpit (Production Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run GPU optimization script
if [ -f "./optimize_gpu.sh" ]; then
    echo "⚡ Running GPU optimization..."
    bash ./optimize_gpu.sh
fi

# Set display environment
export DISPLAY=:0

# Build frontend
echo "📦 Building frontend..."
cd web_ui
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
cd ..

# Start backend
echo "🚀 Starting backend server..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if Chromium is installed
if ! command -v chromium &> /dev/null; then
    echo "❌ Chromium not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y chromium
fi

# Launch Chromium in kiosk mode with GPU acceleration
echo "🖥️  Launching Chromium Kiosk (GPU Accelerated)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Enable V3D GPU driver for Raspberry Pi with maximum performance
export LIBGL_ALWAYS_SOFTWARE=0
export MESA_LOADER_DRIVER_OVERRIDE=v3d
export GALLIUM_DRIVER=v3d
export MESA_GL_VERSION_OVERRIDE=3.3
export MESA_GLSL_VERSION_OVERRIDE=330

# GPU thread priorities
export __GL_THREADED_OPTIMIZATIONS=1
export __GL_SYNC_TO_VBLANK=0

chromium \
    --kiosk \
    --app=http://localhost:8000 \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-session-crashed-bubble \
    --disable-features=Translate \
    --disable-component-update \
    --start-fullscreen \
    --start-maximized \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --enable-accelerated-2d-canvas \
    --enable-gpu-rasterization \
    --enable-zero-copy \
    --enable-native-gpu-memory-buffers \
    --force-gpu-rasterization \
    --ignore-gpu-blocklist \
    --enable-oop-rasterization \
    --enable-features=VaapiVideoDecoder,DefaultANGLEVulkan,Vulkan,Canvas2DImageChromium,WebAssemblySimd \
    --use-gl=egl \
    --use-angle=gl \
    --disable-software-rasterizer \
    --disable-gpu-driver-bug-workarounds \
    --enable-features=UseSkiaRenderer \
    --enable-webgl \
    --enable-webgl2 \
    --enable-gpu-compositing \
    --enable-hardware-overlays \
    --num-raster-threads=4 \
    --gpu-rasterization-msaa-sample-count=0 \
    --disable-extensions \
    --disable-plugins \
    --disable-sync \
    --disable-translate \
    --hide-scrollbars \
    --window-position=0,0 \
    --window-size=1280,720 \
    --disable-smooth-scrolling \
    --disable-dev-shm-usage \
    --enable-low-end-device-mode \
    --force-device-scale-factor=1 \
    --enable-accelerated-video-decode \
    --enable-drdc \
    --canvas-oop-rasterization \
    --enable-viewport \
    --main-frame-resizes-are-orientation-changes \
    --enable-lcd-text \
    --user-data-dir=/tmp/chromium-kiosk \
    --js-flags="--max-old-space-size=512 --gc-interval=100" \
    --disable-background-timer-throttling \
    --disable-backgrounding-occluded-windows \
    --disable-renderer-backgrounding \
    http://localhost:8000 &

CHROMIUM_PID=$!

echo "✓ Yaris Cockpit is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend PID: $BACKEND_PID"
echo "Chromium PID: $CHROMIUM_PID"
echo ""
echo "Press Ctrl+C to stop"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $CHROMIUM_PID 2>/dev/null
    echo "✓ Yaris Cockpit stopped"
}

trap cleanup EXIT INT TERM

# Wait for processes
wait $CHROMIUM_PID
