import { useEffect, useRef } from 'react'
import { useAlerts } from '../contexts/AlertContext'

/**
 * System Connection Monitor
 * Monitors OBD2, GPS, and Bluetooth connections and shows alerts
 */
export function useConnectionMonitor() {
  const { addAlert } = useAlerts()
  const lastCheck = useRef(0)
  const prevStatus = useRef({
    obd: false,
    gps: false,
    bluetooth: false
  })

  useEffect(() => {
    const checkConnections = async () => {
      const now = Date.now()
      
      // Check every 10 seconds
      if (now - lastCheck.current < 10000) return
      lastCheck.current = now

      try {
        // Use dynamic hostname for LAN access
        const apiUrl = `http://${window.location.hostname}:8000/api/status`
        const response = await fetch(apiUrl)
        const status = await response.json()

        // Check OBD2 connection changes
        if (status.obd_connected !== prevStatus.current.obd) {
          if (status.obd_connected) {
            addAlert({
              type: 'success',
              title: 'OBD2 Connected',
              message: 'Vehicle diagnostics system ready',
              icon: 'check'
            })
          } else if (prevStatus.current.obd) {
            // Only alert disconnect if was previously connected
            addAlert({
              type: 'warning',
              title: 'OBD2 Disconnected',
              message: 'Check OBD2 adapter connection',
              icon: 'wrench'
            })
          }
          prevStatus.current.obd = status.obd_connected
        }

        // Check GPS connection changes
        if (status.gps_connected !== prevStatus.current.gps) {
          if (status.gps_connected) {
            addAlert({
              type: 'success',
              title: 'GPS Connected',
              message: 'Navigation system ready',
              icon: 'check'
            })
          } else if (prevStatus.current.gps) {
            addAlert({
              type: 'info',
              title: 'GPS Signal Lost',
              message: 'May be indoors or underground',
              icon: 'alert'
            })
          }
          prevStatus.current.gps = status.gps_connected
        }

        // Check Bluetooth connection changes
        if (status.bluetooth_connected !== prevStatus.current.bluetooth) {
          if (status.bluetooth_connected) {
            addAlert({
              type: 'success',
              title: 'Bluetooth Connected',
              message: 'Ready for music and calls',
              icon: 'check'
            })
          } else if (prevStatus.current.bluetooth) {
            addAlert({
              type: 'info',
              title: 'Bluetooth Disconnected',
              message: 'Ready to pair new device',
              icon: 'alert'
            })
          }
          prevStatus.current.bluetooth = status.bluetooth_connected
        }

      } catch (error) {
        console.error('Connection check failed:', error)
      }
    }

    // Check immediately on mount
    checkConnections()

    // Then check every 5 seconds
    const interval = setInterval(checkConnections, 5000)

    return () => clearInterval(interval)
  }, [addAlert])
}
