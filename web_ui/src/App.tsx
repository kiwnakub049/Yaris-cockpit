import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AlertProvider } from './contexts/AlertContext'
import { BackgroundProvider } from './contexts/BackgroundContext'
import { DemoModeProvider } from './contexts/DemoModeContext'
import { useConnectionMonitor } from './hooks/useConnectionMonitor'
import ScreenCarousel from './components/ScreenCarousel'
import EdgeButtons from './components/EdgeButtons'
import StatusBar from './components/StatusBar'
import SplashScreen from './components/SplashScreen'
import AlertNotification from './components/AlertNotification'
import BackgroundAnimation from './components/BackgroundAnimation'
import RacingGaugePage from './pages/RacingGaugePage'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import BluetoothPage from './pages/BluetoothPage'
import CarPlayPage from './pages/CarPlayPage'
import SettingsPage from './pages/SettingsPage'
import OBDScannerPage from './pages/OBDScannerPage'

function AppContent() {
  const [currentPage, setCurrentPage] = useState(3) // Start at OBD Scanner (index 3) for testing
  const [showSettings, setShowSettings] = useState(false)
  
  // Monitor system connections
  useConnectionMonitor()

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event: any) => {
      const { page } = event.detail
      if (page === 'Settings') {
        setShowSettings(true)
      } else if (page === 'Map') {
        setCurrentPage(1) // Navigate to Map page
      } else if (page === 'OBD Scanner') {
        setCurrentPage(3) // Navigate to OBD Scanner page
      }
    }

    const handleCloseSettings = () => {
      setShowSettings(false)
    }

    window.addEventListener('navigateToPage', handleNavigate)
    window.addEventListener('closeSettings', handleCloseSettings)
    return () => {
      window.removeEventListener('navigateToPage', handleNavigate)
      window.removeEventListener('closeSettings', handleCloseSettings)
    }
  }, [])

  const pages = [
    { id: 0, name: 'Racing', component: <RacingGaugePage /> },
    { id: 1, name: 'Map', component: <MapPage /> },
    { id: 2, name: 'Home', component: <HomePage /> },
    { id: 3, name: 'OBD Scanner', component: <OBDScannerPage /> },
    { id: 4, name: 'Bluetooth', component: <BluetoothPage /> },
    { id: 5, name: 'CarPlay', component: <CarPlayPage /> },
  ]

  const handlePageChange = (direction: 'left' | 'right') => {
    setCurrentPage((prev) => {
      if (direction === 'right') {
        return (prev + 1) % pages.length // Circular: 0 -> 1 -> 2 -> 3 -> 0
      } else {
        return (prev - 1 + pages.length) % pages.length // Circular: 0 <- 1 <- 2 <- 3 <- 0
      }
    })
  }

  return (
    <div className="w-screen h-screen bg-gray-300 dark:bg-tesla-black overflow-hidden no-select transition-colors duration-300">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Status Bar */}
      <StatusBar />

      {/* Main Screen Carousel */}
      <ScreenCarousel
        pages={pages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Edge Navigation Buttons */}
      <EdgeButtons onNavigate={handlePageChange} />

      {/* Settings Overlay */}
      {showSettings && <SettingsPage />}

      {/* Global Alert Notifications */}
      <AlertNotification />
    </div>
  )
}

function App() {
  const [isReady, setIsReady] = useState(false)

  // Simulate app initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider>
      <BackgroundProvider>
        <DemoModeProvider>
          <AlertProvider>
            {!isReady ? (
              <SplashScreen />
            ) : (
              <AppContent />
            )}
          </AlertProvider>
        </DemoModeProvider>
      </BackgroundProvider>
    </ThemeProvider>
  )
}

export default App
