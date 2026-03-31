import { createContext, useContext, useState, ReactNode } from 'react'

interface DemoModeContextType {
  isDemoMode: boolean
  setDemoMode: (enabled: boolean) => void
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('demo-mode')
    return saved === 'true'
  })

  const setDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled)
    localStorage.setItem('demo-mode', String(enabled))
  }

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider')
  }
  return context
}
