# 🚗 Yaris Cockpit 2.0

ระบบแสดงผลมัลติมีเดียสมัยใหม่สำหรับรถยนต์ Yaris 2014 ที่มี UI แบบเว็บ (Web-based UI) ที่ได้รับแรงบันดาลใจจาก Tesla และ Liquid Glass

## 💻 ฟีเจอร์หลัก

- **4 โหมดแสดงผล**: Racing Gauge (เกจ์แข่งรถ), Home Dashboard, Bluetooth Music, CarPlay
- **UI แบบเว็บ**: React/TypeScript พร้อม Tailwind CSS และ GPU acceleration
- **Hardware Integration**: เชื่อมต่อ OBD2, GPS, Bluetooth, CarPlay
- **WebSocket**: อัปเดตข้อมูลแบบเรียลไทม์
- **Cross-platform**: รองรับ Windows, Linux (Raspberry Pi), และ **Android (Termux)**

## 🛠️ การติดตั้ง

### 1. ติดตั้ง Python และ Node.js

#### Windows:
```powershell
# ติดตั้ง Python 3.8+ จาก https://python.org
# ติดตั้ง Node.js 16+ จาก https://nodejs.org
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install python3 python3-pip nodejs npm
```

#### **Android (Termux)**:
```bash
# ติดตั้ง Termux จาก F-Droid หรือ Google Play
# ใน Termux:
pkg update && pkg upgrade
pkg install python git nodejs npm openssh
```

### 2. Clone หรือ Download โปรเจกต์
```bash
git clone <repository-url>
cd yaris-cockpit
```

### 3. ติดตั้ง Dependencies

#### สำหรับ Android/Termux (Demo Mode):
```bash
# Python dependencies (เฉพาะที่จำเป็นสำหรับ demo)
pip install fastapi uvicorn websockets python-multipart

# Frontend dependencies
cd web_ui
npm install
cd ..
```

#### สำหรับ Windows/Linux (Full Hardware):
```bash
# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd web_ui
npm install
cd ..
```

### 4. ตั้งค่า Config
```bash
# คัดลอกไฟล์ config ตัวอย่าง
cp config/app_config.example.json config/app_config.json

# แก้ไขการตั้งค่าตามต้องการ
# ใน Termux ใช้: nano config/app_config.json
# ใน Windows: notepad config/app_config.json
```

## 🚀 การรัน

### **Android/Termux (แนะนำ Demo Mode)**:

#### ติดตั้งและรันอัตโนมัติ:
```bash
# รัน script สำเร็จรูปสำหรับ Android
chmod +x run_demo.sh
./run_demo.sh
```

#### หรือรันด้วยตนเอง:
```bash
# Terminal 1: Backend (Demo Mode)
python backend/main_demo.py

# Terminal 2: Frontend
cd web_ui
npm run dev -- --host 0.0.0.0 --port 3000
```

#### เปิดใน Browser:
เปิด Chrome/Samsung Internet บน Android ไปที่:
- **Development**: `http://localhost:3000`
- **Production**: `http://localhost:8000` (หลัง build)

### Windows/Linux (Development/Production):

#### Development Mode:
```bash
# Terminal 1: Backend
python backend/main.py

# Terminal 2: Frontend dev server
cd web_ui
npm run dev
```

#### Production Mode:
```bash
# Build frontend
cd web_ui
npm run build

# รัน backend (รวม static files)
cd ..
python backend/main.py
```

#### Demo Mode (จำลองข้อมูล):
```bash
# Windows PowerShell
./run_demo.ps1

# Linux/Mac
./run_demo.sh
```

## 📱 การปรับแต่งสำหรับ Android

### การตั้งค่า Termux สำหรับการทำงานต่อเนื่อง:
```bash
# ติดตั้ง Termux:Boot และ Termux:API
# สร้าง startup script
mkdir -p ~/.termux/boot
echo "#!/data/data/com.termux/files/usr/bin/bash
cd ~/yaris-cockpit
./run_demo.sh" > ~/.termux/boot/start_yaris.sh
chmod +x ~/.termux/boot/start_yaris.sh
```

### การเข้าถึงจากอุปกรณ์อื่น:
```bash
# เปิด port ใน firewall (ถ้าต้องการ)
# ใน Termux จะเข้าถึงได้จาก localhost โดยตรง
```

### การใช้ Hardware บน Android:
⚠️ **ข้อจำกัด**: Android ไม่รองรับ USB hardware access แบบ Linux

**ทางเลือก:**
1. **Demo Mode**: ใช้ข้อมูลจำลอง (แนะนำ)
2. **Web APIs**: ใช้ Geolocation และ Web Bluetooth ใน browser
3. **External Hardware**: เชื่อมต่อผ่าน Bluetooth/WiFi adapters

## 📁 โครงสร้างโปรเจกต์

```
yaris-cockpit/
├── backend/              # Python FastAPI backend
│   ├── main.py          # Main API server
│   └── main_demo.py     # Demo mode (mock data)
├── web_ui/              # React/TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── src/                 # Python source code
│   ├── backend/         # Telemetry services
│   ├── drivers/         # Hardware interfaces
│   └── utils/           # Utilities
├── config/              # Configuration files
├── resources/           # Assets (images, sounds, fonts)
└── requirements.txt     # Python dependencies
```

## 🔧 การปรับแต่ง

### เพิ่ม Vehicle Profile:
แก้ไข `config/vehicles/` เพื่อเพิ่มข้อมูลรถใหม่

### ปรับแต่ง UI:
แก้ไขไฟล์ใน `web_ui/src/` และ rebuild ด้วย `npm run build`

### เพิ่ม Hardware Support:
เพิ่ม driver ใหม่ใน `src/drivers/` และ import ใน `backend/main.py`

## 🐛 Troubleshooting

### Backend ไม่รัน:
- ตรวจสอบ Python version (ต้องการ 3.8+)
- ตรวจสอบ dependencies: `pip install -r requirements.txt`

### Frontend ไม่ build:
- ตรวจสอบ Node.js version (ต้องการ 16+)
- ลบ node_modules และติดตั้งใหม่: `rm -rf node_modules && npm install`

### Hardware ไม่เชื่อมต่อ:
- ตรวจสอบ USB permissions (Linux)
- ตรวจสอบ device paths ใน config
- ทดสอบด้วย demo mode ก่อน

## 📄 License

MIT License - ดูรายละเอียดใน LICENSE file

## 🤝 Contributing

1. Fork โปรเจกต์
2. สร้าง feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. สร้าง Pull Request

---

**⚠️ คำเตือน:** ระบบนี้ยังอยู่ในช่วงพัฒนา ใช้ความระมัดระวังเมื่อใช้งานในรถยนต์จริง
python backend/main_demo.py
```

#### Terminal/PowerShell 2: Frontend (Development)
```bash
cd web_ui
npm run dev -- --host localhost --port 3000
```

หรือสำหรับ Production:
```bash
cd web_ui
npm run build
npx serve dist -l 3000
```

### 6. เปิด Browser
เปิด Chrome/Firefox/Edge ไปที่:
- `http://localhost:3000`

## 📊 API Endpoints

- `GET /api/sensors` - ข้อมูลเซ็นเซอร์รถ (RPM, Speed, Temp, Fuel)
- `GET /api/gps` - ข้อมูล GPS (ละติจูด, ลองจิจูด, ความเร็ว)
- `GET /api/bluetooth/status` - สถานะ Bluetooth (Demo)
- `GET /api/carplay/status` - สถานะ CarPlay (Demo)
- `GET /api/system/status` - สถานะระบบ
- `WS /ws/sensors` - WebSocket สำหรับเซ็นเซอร์แบบเรียลไทม์
- `WS /ws/gps` - WebSocket สำหรับ GPS แบบเรียลไทม์

## 🎮 การใช้งาน

1. **Racing Gauge**: แสดงเกจ์ RPM, Speed, Temperature แบบเกมแข่งรถ
2. **Home**: แดชบอร์ดหลักแสดงข้อมูลทั้งหมด
3. **Bluetooth**: จอควบคุมเพลง (จำลอง)
4. **CarPlay**: จอเชื่อมต่อ iPhone (จำลอง)
5. **Map**: แสดงแผนที่ GPS ด้วยข้อมูลจำลอง

## 🔧 การปรับแต่ง

### เพิ่ม Hardware จริง
หากต้องการเชื่อมต่อ Hardware จริง ปรับแต่งใน:
- `src/drivers/obd_interface.py` - เชื่อมต่อ OBD2
- `src/drivers/gps_interface.py` - เชื่อมต่อ GPS
- `src/drivers/bluetooth_interface.py` - เชื่อมต่อ Bluetooth

### ปรับแต่ง UI
แก้ไขใน `web_ui/src/`:
- `components/` - คอมโพเนนต์ UI ต่างๆ
- `pages/` - หน้าแสดงผลต่างๆ
- `hooks/` - Custom hooks สำหรับจัดการข้อมูล

## 🚀 Quick Start Script

รันคำสั่งนี้เพื่อเริ่มระบบแบบรวดเร็ว:

#### Windows (PowerShell):
```powershell
.\run_demo.ps1
```

#### Linux/Mac:
```bash
./run_demo.sh
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.