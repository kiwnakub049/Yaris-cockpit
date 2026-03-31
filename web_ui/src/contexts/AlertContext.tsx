import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type AlertType = 'critical' | 'warning' | 'info' | 'success'
export type AlertIcon = 'flame' | 'droplet' | 'fuel' | 'alert' | 'check' | 'wrench'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  icon: AlertIcon
  timestamp: number
  autoDismiss?: boolean // Auto dismiss after countdown
  dismissible?: boolean // Can be manually dismissed
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      autoDismiss: alert.autoDismiss ?? true,
      dismissible: alert.dismissible ?? true
    }

    setAlerts((prev) => {
      // Check for duplicate alerts (same title within 5 seconds)
      const isDuplicate = prev.some(
        (a) => a.title === newAlert.title && Date.now() - a.timestamp < 5000
      )
      if (isDuplicate) return prev
      
      // Keep max 3 alerts visible
      const updated = [...prev, newAlert]
      return updated.slice(-3)
    })
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider')
  }
  return context
}
