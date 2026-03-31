import { motion } from 'framer-motion'
import { MapPin, Settings2, BarChart3, Radio } from 'lucide-react'
import { useDemoMode } from '../contexts/DemoModeContext'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const { isDemoMode } = useDemoMode()
  const [obdData, setObdData] = useState({
    fuelRate: 0,
    coolantTemp: 0,
    tripDistance: 0,
    fuelLevel: 0,
    range: 0
  })

  useEffect(() => {
    if (isDemoMode) {
      setObdData({
        fuelRate: 8.5,
        coolantTemp: 87,
        tripDistance: 42.8,
        fuelLevel: 45,
        range: 380
      })
      return
    }

    const fetchOBDData = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:8000/api/obd`)
        const data = await response.json()
        setObdData({
          fuelRate: data.fuel_rate || 0,
          coolantTemp: data.coolant_temp || 0,
          tripDistance: data.distance || 0,
          fuelLevel: data.fuel_level || 0,
          range: data.fuel_level ? Math.round((data.fuel_level / 100) * 450) : 0
        })
      } catch (error) {
        console.error('Failed to fetch OBD data:', error)
      }
    }

    fetchOBDData()
    const interval = setInterval(fetchOBDData, 2000)
    return () => clearInterval(interval)
  }, [isDemoMode])
  
  const handleCardClick = (navigateTo?: string) => {
    if (navigateTo) {
      const event = new CustomEvent('navigateToPage', { detail: { page: navigateTo } })
      window.dispatchEvent(event)
    }
  }

  const cards = [
    {
      title: 'Navigation',
      icon: MapPin,
      description: 'GPS navigation & maps',
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/20 dark:border-blue-400/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      navigateTo: 'Map'
    },
    {
      title: 'OBD Scanner',
      icon: Radio,
      description: 'All sensors & diagnostics',
      color: 'from-amber-500/10 to-orange-600/10',
      border: 'border-white/20 dark:border-white/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      navigateTo: 'OBD Scanner'
    },
    {
      title: 'System Info',
      icon: Settings2,
      description: 'Diagnostics & settings',
      color: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/20 dark:border-green-400/20',
      iconColor: 'text-green-600 dark:text-green-400',
      navigateTo: 'Settings'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-tesla-black dark:via-tesla-darkgray dark:to-tesla-black transition-colors duration-300"
    >
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-light mb-2 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-white dark:to-white/70 bg-clip-text text-transparent tracking-tight"
        >
          Welcome
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600 dark:text-white/40 uppercase tracking-wider"
        >
          Swipe to navigate
        </motion.p>
      </div>

      {/* Main Content Grid */}
      <div className="flex gap-6 max-w-6xl w-full items-stretch mb-6">
        {/* Trip Computer Card - Vertical */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl p-6 rounded-3xl border border-cyan-500/30 dark:border-cyan-400/30 w-80 flex flex-col justify-between shadow-xl"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={40} className="text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
              <div>
                <h3 className="text-xl font-light text-gray-800 dark:text-white">Trip Computer</h3>
                <p className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-wider">Real-time data</p>
              </div>
            </div>

            {/* Trip Data */}
            <div className="space-y-5">
              {/* Fuel Consumption */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-white/5">
                <div>
                  <div className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Fuel Rate</div>
                  <div className="text-3xl font-light text-yellow-600 dark:text-yellow-400">{obdData.fuelRate.toFixed(1)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-white/60">L/100km</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">{obdData.fuelRate > 0 ? '↓ -0.3' : '--'}</div>
                </div>
              </div>

              {/* Engine Temp */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-white/5">
                <div>
                  <div className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Coolant</div>
                  <div className="text-3xl font-light text-blue-600 dark:text-blue-400">{obdData.coolantTemp}°C</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-white/60">{obdData.coolantTemp > 90 ? 'High' : 'Normal'}</div>
                  <div className="w-16 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${Math.min(obdData.coolantTemp, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-white/5">
                <div>
                  <div className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Trip Distance</div>
                  <div className="text-3xl font-light text-purple-600 dark:text-purple-400">{obdData.tripDistance.toFixed(1)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-white/60">km</div>
                  <div className="text-xs text-gray-500 dark:text-white/40 mt-1">Today</div>
                </div>
              </div>

              {/* Range */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Range</div>
                  <div className="text-3xl font-light text-orange-600 dark:text-orange-400">{obdData.range}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-white/60">km left</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">⛽ {obdData.fuelLevel}%</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 gap-6 flex-1">
        {cards.map((card, index) => {
          const IconComponent = card.icon
          return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.1 + (0.05 * index), 
              duration: 0.3, 
              ease: [0.16, 1, 0.3, 1]
            }}
            onClick={() => handleCardClick(card.navigateTo)}
            className={`bg-white/10 dark:bg-black/20 backdrop-blur-2xl p-8 rounded-3xl border ${card.border} cursor-pointer active:scale-95 hover:scale-105 transition-all shadow-xl hover:shadow-2xl`}
            style={{ 
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            <IconComponent size={64} strokeWidth={1.5} className={`mb-4 ${card.iconColor} transition-colors`} />
            <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{card.title}</h3>
            <p className="text-gray-600 dark:text-white/50 text-sm">{card.description}</p>
          </motion.div>
        )})}
        </div>
      </div>


    </motion.div>
  )
}
