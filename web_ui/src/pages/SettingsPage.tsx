import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useBackground, BackgroundStyle } from '../contexts/BackgroundContext'
import { useDemoMode } from '../contexts/DemoModeContext'
import {
  Settings2,
  Monitor,
  Volume2,
  Wifi,
  Bluetooth,
  Thermometer,
  Gauge,
  Moon,
  Sun,
  Info,
  HardDrive,
  Cpu,
  Activity,
  MapPin,
  Radio,
  Bell,
  Zap,
  Droplet,
  Wind,
  Eye,
  Clock,
  Download,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  TestTube,
  Waves,
} from 'lucide-react'

export default function SettingsPage() {
  const handleBack = () => {
    const event = new CustomEvent('closeSettings')
    window.dispatchEvent(event)
  }
  const { isDarkMode, toggleTheme } = useTheme()
  const { backgroundStyle, setBackgroundStyle } = useBackground()
  const { isDemoMode, setDemoMode } = useDemoMode()
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(65)
  const [screenTimeout, setScreenTimeout] = useState(30)
  const [obdConnected] = useState(true)
  const [gpsConnected] = useState(true)
  const [btConnected] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius')

  const SettingSection = ({ icon: Icon, title, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl mb-6"
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-300 dark:border-white/10">
        <Icon size={24} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-light text-gray-800 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  )

  const SettingRow = ({ icon: Icon, label, children, description }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/5 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <Icon size={20} strokeWidth={1.5} className="text-gray-600 dark:text-white/60" />
        <div>
          <div className="text-gray-800 dark:text-white font-light">{label}</div>
          {description && (
            <div className="text-xs text-gray-500 dark:text-white/40 mt-1">{description}</div>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled
          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
          : 'bg-gray-300 dark:bg-white/20'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
      />
    </button>
  )

  const Slider = ({
    value,
    onChange,
  }: {
    value: number
    onChange: (v: number) => void
  }) => (
    <div className="w-48">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, 
            rgb(59 130 246) 0%, 
            rgb(59 130 246) ${value}%, 
            rgba(255,255,255,0.1) ${value}%, 
            rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="text-right mt-1 text-sm text-gray-600 dark:text-white/60">{value}%</div>
    </div>
  )

  const StatusIndicator = ({ connected }: { connected: boolean }) => (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
      />
      <span className={`text-sm ${connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-gray-300 dark:bg-tesla-black overflow-y-auto pb-24 pt-6 px-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95"
          >
            <ArrowLeft size={24} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400" />
            <span className="text-gray-800 dark:text-white font-light">Back to Home</span>
          </button>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <Settings2 size={48} strokeWidth={1.5} className="text-gray-800 dark:text-white" />
          <div>
            <h1 className="text-5xl font-light text-gray-800 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
              Configure your cockpit experience
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Display Settings */}
          <SettingSection icon={Monitor} title="Display">
            <SettingRow icon={isDarkMode ? Moon : Sun} label="Theme Mode">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-white/60">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
                <Toggle enabled={isDarkMode} onChange={toggleTheme} />
              </div>
            </SettingRow>

            <SettingRow
              icon={Eye}
              label="Brightness"
              description="Adjust screen brightness"
            >
              <Slider value={brightness} onChange={setBrightness} />
            </SettingRow>

            <SettingRow
              icon={Waves}
              label="Background Animation"
              description="Choose animated background style"
            >
              <select
                value={backgroundStyle}
                onChange={(e) => setBackgroundStyle(e.target.value as BackgroundStyle)}
                className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl px-4 py-2 rounded-xl text-gray-800 dark:text-white border border-white/20 dark:border-white/10 cursor-pointer"
              >
                <option value="gradient-wave">Gradient Wave</option>
                <option value="aurora-flow">Aurora Flow</option>
                <option value="particles-drift">Particles Drift</option>
              </select>
            </SettingRow>

            <SettingRow
              icon={TestTube}
              label="Demo Mode"
              description="Use simulated data for testing"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-white/60">
                  {isDemoMode ? 'Enabled' : 'Disabled'}
                </span>
                <Toggle enabled={isDemoMode} onChange={() => setDemoMode(!isDemoMode)} />
              </div>
            </SettingRow>

            <SettingRow
              icon={Clock}
              label="Screen Timeout"
              description="Auto-sleep after inactivity"
            >
              <select
                value={screenTimeout}
                onChange={(e) => setScreenTimeout(Number(e.target.value))}
                className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl px-4 py-2 rounded-xl text-gray-800 dark:text-white border border-white/20 dark:border-white/10 cursor-pointer"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={0}>Never</option>
              </select>
            </SettingRow>
          </SettingSection>

          {/* Audio Settings */}
          <SettingSection icon={Volume2} title="Audio">
            <SettingRow icon={Volume2} label="Master Volume">
              <Slider value={volume} onChange={setVolume} />
            </SettingRow>

            <SettingRow
              icon={Bell}
              label="Alert Sounds"
              description="Warning and notification sounds"
            >
              <Toggle enabled={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </SettingRow>
          </SettingSection>

          {/* Connections */}
          <SettingSection icon={Wifi} title="Connections">
            <SettingRow
              icon={Radio}
              label="OBD2 Scanner"
              description="ELM327 via Bluetooth"
            >
              <StatusIndicator connected={obdConnected} />
            </SettingRow>

            <SettingRow
              icon={MapPin}
              label="GPS Module"
              description="Location tracking"
            >
              <StatusIndicator connected={gpsConnected} />
            </SettingRow>

            <SettingRow
              icon={Bluetooth}
              label="Bluetooth Audio"
              description="Media streaming"
            >
              <StatusIndicator connected={btConnected} />
            </SettingRow>
          </SettingSection>
        </div>

        {/* Right Column */}
        <div>
          {/* Units & Measurements */}
          <SettingSection icon={Gauge} title="Units & Measurements">
            <SettingRow icon={Gauge} label="Speed & Distance">
              <div className="flex gap-2">
                <button
                  onClick={() => setUnits('metric')}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    units === 'metric'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'glass-card text-gray-600 dark:text-white/60'
                  }`}
                >
                  km/h
                </button>
                <button
                  onClick={() => setUnits('imperial')}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    units === 'imperial'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'glass-card text-gray-600 dark:text-white/60'
                  }`}
                >
                  mph
                </button>
              </div>
            </SettingRow>

            <SettingRow icon={Thermometer} label="Temperature">
              <div className="flex gap-2">
                <button
                  onClick={() => setTempUnit('celsius')}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    tempUnit === 'celsius'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'glass-card text-gray-600 dark:text-white/60'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('fahrenheit')}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    tempUnit === 'fahrenheit'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'glass-card text-gray-600 dark:text-white/60'
                  }`}
                >
                  °F
                </button>
              </div>
            </SettingRow>

            <SettingRow icon={Droplet} label="Fuel Consumption">
              <select className="glass-card px-4 py-2 rounded-xl text-gray-800 dark:text-white border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/5">
                <option>L/100km</option>
                <option>km/L</option>
                <option>mpg (US)</option>
                <option>mpg (UK)</option>
              </select>
            </SettingRow>
          </SettingSection>

          {/* System Information */}
          <SettingSection icon={Info} title="System Information">
            <SettingRow icon={Zap} label="Version">
              <span className="text-gray-600 dark:text-white/60">v2.0.0</span>
            </SettingRow>

            <SettingRow icon={Cpu} label="CPU Usage">
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                </div>
                <span className="text-sm text-gray-600 dark:text-white/60">45%</span>
              </div>
            </SettingRow>

            <SettingRow icon={Activity} label="Memory">
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[62%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                </div>
                <span className="text-sm text-gray-600 dark:text-white/60">62%</span>
              </div>
            </SettingRow>

            <SettingRow icon={HardDrive} label="Storage">
              <div className="text-right">
                <div className="text-gray-800 dark:text-white">24.3 GB free</div>
                <div className="text-xs text-gray-500 dark:text-white/40">of 64 GB</div>
              </div>
            </SettingRow>

            <SettingRow icon={Wifi} label="IP Address">
              <span className="text-gray-600 dark:text-white/60 font-mono text-sm">
                192.168.1.101
              </span>
            </SettingRow>
          </SettingSection>

          {/* Actions */}
          <SettingSection icon={Settings2} title="System Actions">
            <button className="w-full glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all mb-3 active:scale-95">
              <div className="flex items-center gap-3">
                <Download size={20} className="text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                <span className="text-gray-800 dark:text-white">Check for Updates</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all mb-3 active:scale-95">
              <div className="flex items-center gap-3">
                <RotateCcw size={20} className="text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                <span className="text-gray-800 dark:text-white">Reset Trip Computer</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-red-500/10 transition-all active:scale-95 border border-red-500/30">
              <div className="flex items-center gap-3">
                <Wind size={20} className="text-red-600 dark:text-red-400" strokeWidth={1.5} />
                <span className="text-red-700 dark:text-red-400">Factory Reset</span>
              </div>
              <ChevronRight size={20} className="text-red-400" />
            </button>
          </SettingSection>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-gray-500 dark:text-white/30"
      >
        <p>Yaris 2014 Ultimate Cockpit System</p>
        <p className="mt-1">Powered by React + TypeScript • © 2026</p>
      </motion.div>
    </motion.div>
  )
}
