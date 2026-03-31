import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAlerts } from '../contexts/AlertContext'

// WebSocket connection for real-time telemetry
let ws: WebSocket | null = null

interface TelemetryData {
  timestamp: number
  rpm: number
  speed: number
  throttle: number
  coolant_temp: number
  atf_temp: number
  engine_load: number
  intake_temp: number
  fuel_level: number
  ambient_temp: number
  gear: string
  gear_confidence: number
  shift_recommendation: string | null
  is_shift_light: boolean
  is_overheating: boolean
  is_atf_warning: boolean
}

export default function RacingGaugePage() {
  const { addAlert } = useAlerts()
  
  // State for all racing data
  const [rpm, setRpm] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [gear, setGear] = useState('N')
  const [coolantTemp, setCoolantTemp] = useState(85)
  const [atfTemp, setAtfTemp] = useState(90)
  const [throttle, setThrottle] = useState(0)
  const [peakRpm, setPeakRpm] = useState(0)
  const [isShiftLight, setIsShiftLight] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Track last alert times to prevent spam
  const lastAlertTime = useRef({
    coolant: 0,
    atf: 0,
    fuel: 0,
    rpm: 0,
    load: 0,
    connection: 0
  })

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      // Connect to racing telemetry WebSocket (works on any device in LAN)
      const wsUrl = `ws://${window.location.hostname}:8000/ws/racing`
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('✓ Racing telemetry connected')
        setIsConnected(true)
        
        // Show connection success alert
        const now = Date.now()
        if (now - lastAlertTime.current.connection > 10000) {
          addAlert({
            type: 'success',
            title: '✅ เชื่อมต่อ OBD2 สำเร็จ',
            message: 'ระบบ Racing Telemetry พร้อมใช้งาน',
            icon: 'check'
          })
          lastAlertTime.current.connection = now
        }
      }

      ws.onmessage = (event) => {
        try {
          const data: TelemetryData = JSON.parse(event.data)
          
          // Update all states from real telemetry
          setRpm(data.rpm)
          setSpeed(data.speed)
          setGear(data.gear)
          setCoolantTemp(data.coolant_temp)
          setAtfTemp(data.atf_temp)
          setThrottle(data.throttle)
          setIsShiftLight(data.is_shift_light)
          
          // Update peak RPM
          setPeakRpm((prev) => Math.max(prev, data.rpm))
          
          // Check and trigger alerts
          checkAlerts(data)
        } catch (error) {
          console.error('Error parsing telemetry data:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }

      ws.onclose = () => {
        console.log('WebSocket closed - reconnecting in 2s...')
        setIsConnected(false)
        
        // Show disconnection alert
        const now = Date.now()
        if (now - lastAlertTime.current.connection > 10000) {
          addAlert({
            type: 'warning',
            title: '⚠️ การเชื่อมต่อขาดหาย',
            message: 'กำลังพยายามเชื่อมต่อใหม่...',
            icon: 'alert'
          })
          lastAlertTime.current.connection = now
        }
        
        setTimeout(connectWebSocket, 2000) // Auto-reconnect
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close()
        ws = null
      }
    }
  }, [])

  // Alert checking function
  const checkAlerts = (data: TelemetryData) => {
    const now = Date.now()
    const ALERT_COOLDOWN = 30000 // 30 seconds between same alerts

    // Critical: Coolant overheating (>105°C)
    if (data.coolant_temp >= 105 && now - lastAlertTime.current.coolant > ALERT_COOLDOWN) {
      addAlert({
        type: 'critical',
        title: '⚠️ น้ำหล่อเย็นร้อนเกินไป!',
        message: `อุณหภูมิ ${data.coolant_temp.toFixed(1)}°C - จอดรถและดับเครื่องทันที`,
        icon: 'flame'
      })
      lastAlertTime.current.coolant = now
    }
    // Warning: Coolant high temp (100-105°C)
    else if (data.coolant_temp >= 100 && data.coolant_temp < 105 && now - lastAlertTime.current.coolant > ALERT_COOLDOWN) {
      addAlert({
        type: 'warning',
        title: 'คำเตือน: น้ำหล่อเย็นร้อน',
        message: `อุณหภูมิ ${data.coolant_temp.toFixed(1)}°C - ลดความเร็วและระวัง`,
        icon: 'droplet'
      })
      lastAlertTime.current.coolant = now
    }

    // Critical: ATF overheating (>115°C)
    if (data.atf_temp >= 115 && now - lastAlertTime.current.atf > ALERT_COOLDOWN) {
      addAlert({
        type: 'critical',
        title: '⚠️ น้ำมันเกียร์ร้อนวิกฤต!',
        message: `อุณหภูมิ ${data.atf_temp.toFixed(1)}°C - หยุดขับทันที เสี่ยงเสียเกียร์`,
        icon: 'flame'
      })
      lastAlertTime.current.atf = now
    }
    // Warning: ATF high temp (110-115°C)
    else if (data.atf_temp >= 110 && data.atf_temp < 115 && now - lastAlertTime.current.atf > ALERT_COOLDOWN) {
      addAlert({
        type: 'warning',
        title: 'คำเตือน: น้ำมันเกียร์ร้อน',
        message: `อุณหภูมิ ${data.atf_temp.toFixed(1)}°C - ลดการใช้งานหนัก`,
        icon: 'droplet'
      })
      lastAlertTime.current.atf = now
    }

    // Warning: Low fuel (<15%)
    if (data.fuel_level <= 15 && data.fuel_level > 5 && now - lastAlertTime.current.fuel > ALERT_COOLDOWN) {
      addAlert({
        type: 'warning',
        title: 'น้ำมันเชื้อเพลิงเหลือน้อย',
        message: `เหลือ ${data.fuel_level.toFixed(0)}% - หาปั๊มเติมน้ำมัน`,
        icon: 'fuel'
      })
      lastAlertTime.current.fuel = now
    }
    // Critical: Very low fuel (<5%)
    else if (data.fuel_level <= 5 && now - lastAlertTime.current.fuel > ALERT_COOLDOWN) {
      addAlert({
        type: 'critical',
        title: '⚠️ น้ำมันใกล้หมด!',
        message: `เหลือเพียง ${data.fuel_level.toFixed(0)}% - เติมน้ำมันด่วน`,
        icon: 'fuel'
      })
      lastAlertTime.current.fuel = now
    }

    // Warning: Over-revving (>6800 RPM sustained)
    if (data.rpm >= 6800 && now - lastAlertTime.current.rpm > ALERT_COOLDOWN) {
      addAlert({
        type: 'warning',
        title: 'RPM สูงเกินไป',
        message: `${data.rpm} RPM - เปลี่ยนเกียร์หรือลดรอบ`,
        icon: 'alert'
      })
      lastAlertTime.current.rpm = now
    }

    // Info: High engine load for extended period (>95%)
    if (data.engine_load >= 95 && now - lastAlertTime.current.load > ALERT_COOLDOWN * 2) {
      addAlert({
        type: 'info',
        title: 'เครื่องยนต์ทำงานหนัก',
        message: `Load ${data.engine_load.toFixed(0)}% - ระวังอุณหภูมิสูง`,
        icon: 'wrench'
      })
      lastAlertTime.current.load = now
    }
  }

  // Peak hold reset
  useEffect(() => {
    const timer = setTimeout(() => {
      setPeakRpm(rpm)
    }, 2000)
    return () => clearTimeout(timer)
  }, [peakRpm, rpm])

  const getRpmColor = () => {
    if (rpm >= 6000) return '#ff0000'
    if (rpm >= 5000) return '#ff9500'
    if (rpm >= 4000) return '#ffcc00'
    return '#00ff88'
  }

  const getTempColor = (temp: number, maxSafe: number) => {
    if (temp >= maxSafe + 10) return '#ff0000'
    if (temp >= maxSafe) return '#ff9500'
    if (temp >= maxSafe - 10) return '#ffcc00'
    return '#00ff88'
  }

  const coolantColor = getTempColor(coolantTemp, 95)
  const atfColor = getTempColor(atfTemp, 110)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full bg-black relative overflow-hidden"
    >
      {/* Shift Light Flash */}
      {isShiftLight && (
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="absolute inset-0 bg-red-600 pointer-events-none z-10"
          style={{ opacity: 0.4 }}
        />
      )}

      {/* Main Content */}
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        {/* Top Health Bar */}
        <div className="absolute top-8 left-0 right-0 flex justify-between px-12">
          {/* Coolant Temp */}
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Coolant</span>
              <span 
                className="text-4xl font-mono font-light tracking-tight"
                style={{ color: coolantColor }}
              >
                {coolantTemp.toFixed(1)}°C
              </span>
            </div>
            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full"
                style={{ 
                  width: `${Math.min((coolantTemp / 120) * 100, 100)}%`,
                  backgroundColor: coolantColor
                }}
              />
            </div>
            {coolantTemp >= 100 && (
              <span className="text-xs text-red-500 font-mono animate-pulse">⚠ HIGH TEMP</span>
            )}
          </div>

          {/* Shift Light Indicator */}
          <div className="flex items-center gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-sm transition-all duration-100"
                style={{
                  backgroundColor: rpm >= 5500 + (i * 200) ? '#ff0000' : 'rgba(255,255,255,0.1)',
                  boxShadow: rpm >= 5500 + (i * 200) ? '0 0 20px #ff0000' : 'none'
                }}
              />
            ))}
          </div>

          {/* ATF Temp */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-baseline gap-3">
              <span 
                className="text-4xl font-mono font-light tracking-tight"
                style={{ color: atfColor }}
              >
                {atfTemp.toFixed(1)}°C
              </span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-mono">ATF Temp</span>
            </div>
            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full"
                style={{ 
                  width: `${Math.min((atfTemp / 130) * 100, 100)}%`,
                  backgroundColor: atfColor
                }}
              />
            </div>
            {atfTemp >= 110 && (
              <span className="text-xs text-red-500 font-mono animate-pulse">⚠ HIGH TEMP</span>
            )}
          </div>
        </div>

        {/* Center: RPM Gauge + Gear */}
        <div className="relative flex items-center justify-center mt-16">
          {/* RPM Bar (Horizontal Motec Style) */}
          <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-[800px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/40 font-mono uppercase tracking-widest">RPM</span>
              <div className="flex-1 h-16 bg-white/5 rounded-lg overflow-hidden relative">
                {/* Background ticks */}
                <div className="absolute inset-0 flex">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-white/10" />
                  ))}
                </div>
                
                {/* Peak hold marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white/60"
                  style={{ left: `${(peakRpm / 7000) * 100}%` }}
                />
                
                {/* RPM fill */}
                <div 
                  className="h-full transition-all duration-100 relative"
                  style={{ 
                    width: `${(rpm / 7000) * 100}%`,
                    backgroundColor: getRpmColor(),
                    boxShadow: `0 0 30px ${getRpmColor()}`
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
              </div>
              <span 
                className="text-5xl font-mono font-light w-32 text-right tracking-tight"
                style={{ color: getRpmColor() }}
              >
                {rpm}
              </span>
            </div>
            
            {/* RPM scale */}
            <div className="flex justify-between text-xs text-white/30 font-mono px-1">
              <span>0</span>
              <span>1k</span>
              <span>2k</span>
              <span>3k</span>
              <span>4k</span>
              <span>5k</span>
              <span className="text-yellow-500">6k</span>
              <span className="text-red-500">7k</span>
            </div>
          </div>

          {/* Gear Indicator (Giant Center) */}
          <div className="relative z-20">
            <motion.div
              key={gear}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative"
            >
              <div 
                className="text-[280px] font-mono font-bold leading-none"
                style={{ 
                  color: '#ffffff',
                  textShadow: `0 0 60px ${getRpmColor()}, 0 0 100px ${getRpmColor()}`,
                  WebkitTextStroke: '2px rgba(255,255,255,0.3)'
                }}
              >
                {gear}
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-white/40 uppercase tracking-[0.3em] font-mono">
                gear
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom: Speed + Throttle */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-between items-end px-12">
          {/* Throttle */}
          <div className="flex items-end gap-3">
            <div className="w-4 h-48 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-100 rounded-full"
                style={{ height: `${throttle}%` }}
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-4xl font-mono font-light text-white">{throttle}%</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Throttle</span>
            </div>
          </div>

          {/* Speed (Large but secondary) */}
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-8xl font-mono font-light text-white tracking-tight">{speed}</span>
              <span className="text-2xl text-white/40 font-mono mb-4">km/h</span>
            </div>
            <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Speed</span>
          </div>
        </div>
      </div>

      {/* Corner info */}
      <div className="absolute top-4 left-4 text-xs text-white/30 font-mono space-y-1">
        <div>YARIS RACE MODE</div>
        <div>Peak: {peakRpm} RPM</div>
        <div className="flex items-center gap-2">
          <span className={isConnected ? 'text-green-500' : 'text-red-500'}>●</span>
          <span>{isConnected ? 'OBD2 CONNECTED' : 'SIMULATION MODE'}</span>
        </div>
      </div>
    </motion.div>
  )
}
