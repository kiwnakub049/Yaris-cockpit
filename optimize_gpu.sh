#!/bin/bash
# GPU Performance Tuning Script for Raspberry Pi 4

echo "🚀 Optimizing GPU Performance..."

# Set GPU governor to performance mode
if [ -f /sys/class/devfreq/*/governor ]; then
    echo "performance" | sudo tee /sys/class/devfreq/*/governor > /dev/null
    echo "✓ GPU governor set to performance"
fi

# Set CPU governor to performance mode for all cores
for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
    if [ -f "$cpu/cpufreq/scaling_governor" ]; then
        echo "performance" | sudo tee "$cpu/cpufreq/scaling_governor" > /dev/null
    fi
done
echo "✓ CPU governor set to performance (all cores)"

# Disable CPU frequency scaling to prevent throttling
if [ -f /sys/devices/system/cpu/cpufreq/boost ]; then
    echo 1 | sudo tee /sys/devices/system/cpu/cpufreq/boost > /dev/null
    echo "✓ CPU boost enabled"
fi

# Increase GPU clock speed (Raspberry Pi 4)
sudo vcgencmd measure_clock core
sudo vcgencmd measure_clock v3d

# Set GPU memory split (already done in config.txt)
echo "✓ GPU memory: $(vcgencmd get_mem gpu)"

# Optimize memory management
sudo sysctl -w vm.swappiness=10
sudo sysctl -w vm.vfs_cache_pressure=50
sudo sysctl -w vm.dirty_ratio=15
sudo sysctl -w vm.dirty_background_ratio=5
echo "✓ Memory optimization applied"

# Network optimization
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728
sudo sysctl -w net.ipv4.tcp_rmem='10240 87380 134217728'
sudo sysctl -w net.ipv4.tcp_wmem='10240 87380 134217728'
echo "✓ Network optimization applied"

# Disable unnecessary services to free resources
sudo systemctl stop bluetooth 2>/dev/null
sudo systemctl stop cups 2>/dev/null
sudo systemctl stop avahi-daemon 2>/dev/null
echo "✓ Unnecessary services stopped"

echo "✅ GPU Performance Optimization Complete!"
echo ""
echo "Current Status:"
echo "  CPU Freq: $(vcgencmd measure_clock arm)"
echo "  GPU Freq: $(vcgencmd measure_clock core)"
echo "  V3D Freq: $(vcgencmd measure_clock v3d)"
echo "  Temperature: $(vcgencmd measure_temp)"
echo "  Throttled: $(vcgencmd get_throttled)"
