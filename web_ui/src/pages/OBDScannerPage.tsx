import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Star, Save, Info, CheckCircle2 } from 'lucide-react'
import { useAlerts } from '../contexts/AlertContext'

interface SensorData {
  value: string
  command: string
  desc: string
}

interface ScannerData {
  timestamp: number
  connected: boolean
  total_sensors: number
  sensors: Record<string, SensorData>
}

interface VINData {
  vin: string | null
  has_config: boolean
  config?: {
    vin: string
    sensors: string[]
    metadata: any
    last_updated: string
  }
}

export default function OBDScannerPage() {
  const { addAlert } = useAlerts()
  const [scannerData, setScannerData] = useState<ScannerData | null>(null)
  const [vinData, setVinData] = useState<VINData | null>(null)
  const [selectedSensors, setSelectedSensors] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'value'>('name')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Fetch VIN on mount
  useEffect(() => {
    fetch(`http://${window.location.hostname}:8000/api/obd/vin`)
      .then(res => res.json())
      .then(data => {
        setVinData(data)
        // Load saved sensors if config exists
        if (data.has_config && data.config?.sensors) {
          setSelectedSensors(new Set(data.config.sensors))
        }
      })
      .catch(err => console.error('Failed to fetch VIN:', err))
  }, [])

  // WebSocket connection for real-time sensor data
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/obd/scanner`
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('✓ Connected to OBD Scanner')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setScannerData(data)
          } catch (error) {
            console.error('Error parsing sensor data:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('OBD Scanner WebSocket error:', error)
        }

        ws.onclose = () => {
          setScannerData(null)
          reconnectTimer = setTimeout(connect, 3000)
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error)
      }
    }

    connect()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [])

  // Toggle sensor selection
  const toggleSensor = (sensorName: string) => {
    setSelectedSensors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sensorName)) {
        newSet.delete(sensorName)
      } else {
        newSet.add(sensorName)
      }
      return newSet
    })
  }

  // Save configuration
  const handleSaveConfig = async () => {
    if (!vinData?.vin) {
      addAlert({
        type: 'critical',
        title: '❌ ไม่พบ VIN',
        message: 'ไม่สามารถบันทึกค่าได้ เนื่องจากไม่พบเลข VIN ของรถ',
        icon: 'alert'
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/obd/sensors/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: vinData.vin,
          sensors: Array.from(selectedSensors),
          metadata: {
            timestamp: new Date().toISOString(),
            total_sensors: selectedSensors.size
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        addAlert({
          type: 'success',
          title: '✅ บันทึกสำเร็จ',
          message: `บันทึก ${selectedSensors.size} sensors สำหรับรถ VIN: ${vinData.vin.slice(-8)}`,
          icon: 'check'
        })
        setShowSaveDialog(false)
        
        // Reload VIN data to get updated config
        const vinResponse = await fetch(`http://${window.location.hostname}:8000/api/obd/vin`)
        const vinDataUpdated = await vinResponse.json()
        setVinData(vinDataUpdated)
      } else {
        throw new Error(result.error || 'Failed to save')
      }
    } catch (error) {
      addAlert({
        type: 'critical',
        title: '❌ บันทึกไม่สำเร็จ',
        message: 'เกิดข้อผิดพลาดในการบันทึกค่า กรุณาลองใหม่',
        icon: 'alert'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Filter and sort sensors
  const getSortedSensors = () => {
    if (!scannerData?.sensors) return []

    const entries = Object.entries(scannerData.sensors)

    // Filter by favorites if enabled
    let filtered = entries
    if (showOnlyFavorites) {
      filtered = entries.filter(([name]) => selectedSensors.has(name))
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(([name, data]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a[0].localeCompare(b[0])
      } else {
        return a[1].value.localeCompare(b[1].value)
      }
    })

    return filtered
  }

  const sortedSensors = getSortedSensors()

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-tesla-black dark:via-tesla-darkgray dark:to-tesla-black transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl flex items-center justify-center border border-amber-500/20">
              <Radio size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-gray-800 dark:text-white">OBD2 Scanner</h1>
              {vinData?.vin && (
                <p className="text-xs text-gray-600 dark:text-white/50 font-mono">
                  VIN: {vinData.vin}
                </p>
              )}
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            {scannerData?.connected ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 dark:bg-green-400/10 backdrop-blur-xl border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 dark:bg-red-400/10 backdrop-blur-xl border border-red-500/20">
                <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Offline</span>
              </div>
            )}

            {/* Sensor Count */}
            <div className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20">
              <span className="font-semibold text-gray-900 dark:text-white">{scannerData?.total_sensors || 0}</span>
              <span className="text-xs ml-1.5 text-gray-600 dark:text-white/50">sensors</span>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveDialog(true)}
              disabled={selectedSensors.size === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={18} />
              Save ({selectedSensors.size})
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search sensors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 focus:outline-none focus:border-amber-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/40"
            />
            <Radio size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/40" />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'value')}
            className="px-4 py-2.5 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 focus:outline-none text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="value">Sort by Value</option>
          </select>

          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-4 py-2.5 rounded-xl backdrop-blur-xl border transition-all ${
              showOnlyFavorites
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400'
                : 'bg-white/10 dark:bg-white/5 border-white/20 text-gray-600 dark:text-white/60'
            }`}
          >
            <Star size={18} className={showOnlyFavorites ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {!scannerData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-amber-500 mb-4 mx-auto" />
              <p className="text-sm text-gray-600 dark:text-white/50">Connecting to OBD2...</p>
            </div>
          </div>
        ) : sortedSensors.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Radio size={48} className="mx-auto mb-4 text-gray-400 dark:text-white/20" />
              <p className="text-gray-600 dark:text-white/50">No sensors found</p>
              <p className="text-xs text-gray-500 dark:text-white/30 mt-1">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedSensors.map(([name, data]) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleSensor(name)}
                className={`group relative p-5 rounded-2xl backdrop-blur-2xl border cursor-pointer transition-all ${
                  selectedSensors.has(name)
                    ? 'bg-amber-500/20 dark:bg-amber-400/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-white/10 dark:bg-white/5 border-white/20 hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              >
                {/* Favorite Star */}
                <div className="absolute top-3 right-3">
                  <Star
                    size={20}
                    className={`transition-all ${
                      selectedSensors.has(name)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-400 dark:text-white/30'
                    }`}
                  />
                </div>

                {/* Sensor Name */}
                <h3 className="font-medium text-xs mb-2 text-amber-600 dark:text-amber-400 tracking-wide uppercase pr-6">
                  {name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-white/40 mb-4 line-clamp-2">
                  {data.desc}
                </p>

                {/* Value */}
                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="text-2xl font-light text-gray-900 dark:text-white font-mono">
                    {data.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {scannerData && sortedSensors.length > 0 && (
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-t border-white/20 p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-white/50">
            Showing {sortedSensors.length} of {scannerData.total_sensors} sensors
            {searchTerm && ` • Filtered by "${searchTerm}"`}
            {showOnlyFavorites && ` • Favorites only`}
          </p>
        </div>
      )}

      {/* Save Configuration Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 max-w-md mx-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Save size={24} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">Save Configuration</h2>
                  <p className="text-sm text-gray-600 dark:text-white/50">Save sensor preferences for this vehicle</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-white/70">
                    <p className="mb-2">
                      <strong>VIN:</strong> {vinData?.vin || 'Unknown'}
                    </p>
                    <p>
                      <strong>Selected Sensors:</strong> {selectedSensors.size}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-white/40 mt-2">
                      These sensors will be used in Racing Gauge and other pages
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-5 py-3 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 text-gray-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
