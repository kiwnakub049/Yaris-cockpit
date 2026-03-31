import { createContext, useContext, useState, ReactNode } from 'react'

export type BackgroundStyle = 'gradient-wave' | 'aurora-flow' | 'particles-drift'

interface BackgroundContextType {
  backgroundStyle: BackgroundStyle
  setBackgroundStyle: (style: BackgroundStyle) => void
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined)

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [backgroundStyle, setBackgroundStyleState] = useState<BackgroundStyle>(() => {
    const saved = localStorage.getItem('background-style')
    return (saved as BackgroundStyle) || 'gradient-wave'
  })

  const setBackgroundStyle = (style: BackgroundStyle) => {
    setBackgroundStyleState(style)
    localStorage.setItem('background-style', style)
  }

  return (
    <BackgroundContext.Provider value={{ backgroundStyle, setBackgroundStyle }}>
      {children}
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  const context = useContext(BackgroundContext)
  if (!context) {
    throw new Error('useBackground must be used within BackgroundProvider')
  }
  return context
}
