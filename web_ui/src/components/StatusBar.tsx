import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useDemoMode } from '../contexts/DemoModeContext'
import { Settings2, Sun, Moon, Monitor, Radio, MapPin, Bluetooth } from 'lucide-react'

export default function StatusBar() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { isDemoMode } = useDemoMode()
  const [time, setTime] = useState(new Date())
  const [speed, setSpeed] = useState(0)
  const [obdConnected, setObdConnected] = useState(false)
  const [gpsConnected, setGpsConnected] = useState(false)
  const [btConnected, setBtConnected] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch real-time data from API
  useEffect(() => {
    if (isDemoMode) {
      setSpeed(65)
      setObdConnected(true)
      setGpsConnected(true)
      setBtConnected(true)
      return
    }

    const fetchData = async () => {
      try {
        const apiUrl = `http://${window.location.hostname}:8000/api/status`
        const response = await fetch(apiUrl)
        const data = await response.json()
        setObdConnected(data.obd_connected || false)
        setGpsConnected(data.gps_connected || false)
        setBtConnected(data.bluetooth_connected || false)
      } catch (error) {
        console.error('Failed to fetch status:', error)
      }

      try {
        const obdUrl = `http://${window.location.hostname}:8000/api/obd`
        const response = await fetch(obdUrl)
        const data = await response.json()
        setSpeed(Math.round(data.speed || 0))
      } catch (error) {
        console.error('Failed to fetch OBD data:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [isDemoMode])

  const handleDesktopMode = async () => {
    try {
      await fetch('http://localhost:8080/api/desktop_mode', { method: 'POST' })
    } catch (error) {
      console.error('Failed to switch to desktop mode:', error)
    }
  }

  const handleSettingsClick = () => {
    const event = new CustomEvent('navigateToPage', { detail: { page: 'Settings' } })
    window.dispatchEvent(event)
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-white/10 dark:bg-black/20 backdrop-blur-2xl z-50 flex items-center justify-between px-8 transition-colors duration-300 border-t border-white/20 dark:border-white/10 shadow-xl">
      {/* Left: Time & Connection Status */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-3xl font-light tracking-tight text-gray-900 dark:text-white transition-colors">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mt-0.5 transition-colors">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {/* Divider */}
        <div className="w-px h-12 bg-gray-300 dark:bg-white/10 transition-colors" />
        
        {/* Status Icons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Radio size={14} className={obdConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} strokeWidth={2} />
            <span className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-wider">OBD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className={gpsConnected ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} strokeWidth={2} />
            <span className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-wider">GPS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bluetooth size={14} className={btConnected ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'} strokeWidth={2} />
            <span className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-wider">BT</span>
          </div>
        </div>
      </div>

      {/* Center: Speed Display */}
      <div className="flex flex-col items-center">
        <div className="text-4xl font-light tracking-tight text-green-600 dark:text-green-400 transition-colors">{speed}</div>
        <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-wider mt-0.5 transition-colors">km/h</div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Settings Button */}
        <button
          onClick={handleSettingsClick}
          className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl px-4 py-3 rounded-xl border border-green-500/30 dark:border-green-400/30 hover:bg-white/20 dark:hover:bg-black/30 active:scale-95 transition-all shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={18} strokeWidth={1.5} className="text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-700 dark:text-white font-light">Settings</span>
          </div>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`bg-white/10 dark:bg-black/20 backdrop-blur-2xl px-4 py-3 rounded-xl border transition-all active:scale-95 shadow-lg ${
            isDarkMode 
              ? 'border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30'
              : 'border-yellow-500/30 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon size={18} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun size={18} strokeWidth={1.5} className="text-yellow-600" />
            )}
            <span className={`text-xs font-light ${
              isDarkMode ? 'text-gray-600 dark:text-gray-400' : 'text-yellow-600'
            }`}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </div>
        </button>

        {/* Desktop Mode */}
        <button
          onClick={handleDesktopMode}
          className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl px-4 py-3 rounded-xl border border-orange-500/30 dark:border-orange-400/30 hover:bg-white/20 dark:hover:bg-black/30 active:scale-95 transition-all shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Monitor size={18} strokeWidth={1.5} className="text-orange-600 dark:text-orange-400" />
            <span className="text-xs text-gray-700 dark:text-white font-light">Desktop</span>
          </div>
        </button>
      </div>
    </div>
  )
}
