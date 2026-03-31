import { useState, useEffect } from 'react'
import { useDemoMode } from '../contexts/DemoModeContext'

interface SensorConfig {
  vin: string
  sensors: string[]
  metadata: any
  last_updated: string
}

interface VINData {
  vin: string | null
  has_config: boolean
  config?: SensorConfig
}

// Mock sensor data for demo mode
const MOCK_SENSORS = [
  'rpm', 'speed', 'coolant_temp', 'fuel_level', 'engine_load',
  'throttle_position', 'intake_temp', 'maf', 'gear'
]

/**
 * Custom hook to load saved vehicle sensor configuration
 * Returns the list of sensors saved for the current vehicle (by VIN)
 */
export function useVehicleSensors() {
  const { isDemoMode } = useDemoMode()
  const [loading, setLoading] = useState(true)
  const [vinData, setVinData] = useState<VINData | null>(null)
  const [savedSensors, setSavedSensors] = useState<string[]>([])

  useEffect(() => {
    loadSensorConfig()
  }, [isDemoMode])

  const loadSensorConfig = async () => {
    try {
      if (isDemoMode) {
        // Demo mode: use mock data
        setVinData({
          vin: 'DEMO123456789',
          has_config: true,
          config: {
            vin: 'DEMO123456789',
            sensors: MOCK_SENSORS,
            metadata: { demo: true },
            last_updated: new Date().toISOString()
          }
        })
        setSavedSensors(MOCK_SENSORS)
        setLoading(false)
        return
      }

      const response = await fetch(`http://${window.location.hostname}:8000/api/obd/vin`)
      const data = await response.json()

      setVinData(data)

      if (data.has_config && data.config?.sensors) {
        setSavedSensors(data.config.sensors)
      }
    } catch (error) {
      console.error('Failed to load sensor config:', error)
      // Fallback to demo mode if API fails
      if (!isDemoMode) {
        console.log('API failed, falling back to demo sensors')
        setVinData({
          vin: 'DEMO123456789',
          has_config: true,
          config: {
            vin: 'DEMO123456789',
            sensors: MOCK_SENSORS,
            metadata: { fallback: true },
            last_updated: new Date().toISOString()
          }
        })
        setSavedSensors(MOCK_SENSORS)
      }
    } finally {
      setLoading(false)
    }
  }

  const hasSensor = (sensorName: string) => {
    return savedSensors.includes(sensorName)
  }

  return {
    loading,
    vinData,
    savedSensors,
    hasSensor,
    reload: loadSensorConfig
  }
}
