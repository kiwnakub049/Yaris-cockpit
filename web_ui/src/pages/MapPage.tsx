import { useState, useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import { motion, AnimatePresence } from 'framer-motion'
import { useDemoMode } from '../contexts/DemoModeContext'
import { Download, MapPin, Navigation, Satellite } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'

interface GPSData {
  connected: boolean
  latitude: number
  longitude: number
  speed: number
  heading: number
  altitude: number
  satellites: number
}

export default function MapPage() {
  const { isDemoMode } = useDemoMode()
  const [gpsData, setGpsData] = useState<GPSData>({
    connected: false,
    latitude: 13.7563, // Bangkok default
    longitude: 100.5018,
    speed: 0,
    heading: 0,
    altitude: 0,
    satellites: 0,
  })
  const [showDownloadDialog, setShowDownloadDialog] = useState(true)
  const [selectedTileSource, setSelectedTileSource] = useState<'online' | 'offline' | null>(null)
  const [autoCenter, setAutoCenter] = useState(true)
  const mapRef = useRef<any>(null)

  // GPS WebSocket connection
  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: simulate GPS
      const interval = setInterval(() => {
        setGpsData(prev => ({
          connected: true,
          latitude: prev.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.0001,
          speed: 45 + Math.random() * 20,
          heading: (prev.heading + Math.random() * 5) % 360,
          altitude: 15,
          satellites: 8,
        }))
      }, 200)
      return () => clearInterval(interval)
    }

    // Real GPS via WebSocket
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/gps`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setGpsData(data)
    }

    ws.onerror = (error) => {
      console.error('GPS WebSocket error:', error)
    }

    return () => ws.close()
  }, [isDemoMode])

  // Auto-center map on GPS position
  useEffect(() => {
    if (autoCenter && mapRef.current && gpsData.connected) {
      mapRef.current.flyTo({
        center: [gpsData.longitude, gpsData.latitude],
        duration: 1000,
      })
    }
  }, [gpsData.latitude, gpsData.longitude, autoCenter])

  const handleTileSourceSelect = (source: 'online' | 'offline') => {
    setSelectedTileSource(source)
    setShowDownloadDialog(false)
  }

  // Tesla-style dark theme map style
  const mapStyle = {
    version: 8 as const,
    sources: {
      'raster-tiles': {
        type: 'raster' as const,
        tiles: selectedTileSource === 'offline' 
          ? [`http://${window.location.hostname}:8000/tiles/{z}/{x}/{y}.png`]
          : ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster' as const,
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  }

  return (
    <div className="relative w-full h-full bg-[#1a1a1a]">
      {/* Map Container */}
      <Map
        ref={mapRef}
        mapLib={import('maplibre-gl')}
        initialViewState={{
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" showCompass={true} />

        {/* GPS Position Marker */}
        {gpsData.connected && (
          <Marker
            latitude={gpsData.latitude}
            longitude={gpsData.longitude}
            anchor="center"
          >
            <motion.div
              className="relative"
              animate={{ rotate: gpsData.heading }}
              transition={{ duration: 0.3 }}
            >
              {/* Car icon with heading */}
              <div className="w-12 h-12 bg-[#00d4ff] rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                <Navigation size={24} className="text-white" />
              </div>
              {/* Accuracy circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-[#00d4ff]/30 rounded-full animate-pulse" />
            </motion.div>
          </Marker>
        )}
      </Map>

      {/* Speed & GPS Info Overlay - Tesla Style */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-white/20 shadow-xl">
          <div className="flex items-center gap-6">
            {/* Speed Display */}
            <div className="text-center">
              <div className="text-5xl font-light text-white">
                {Math.round(gpsData.speed)}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider mt-1">
                km/h
              </div>
            </div>

            <div className="w-px h-12 bg-white/20" />

            {/* GPS Status */}
            <div className="flex items-center gap-3">
              <Satellite
                size={20}
                className={gpsData.connected ? 'text-green-400' : 'text-red-400'}
              />
              <div>
                <div className={`text-sm font-medium ${gpsData.connected ? 'text-green-400' : 'text-red-400'}`}>
                  {gpsData.connected ? 'GPS Connected' : 'GPS Searching...'}
                </div>
                <div className="text-xs text-white/60">
                  {gpsData.satellites} satellites
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Center Toggle */}
      <button
        onClick={() => setAutoCenter(!autoCenter)}
        className={`absolute top-6 right-6 z-10 p-4 rounded-xl backdrop-blur-2xl border transition-all shadow-xl ${
          autoCenter
            ? 'bg-[#00d4ff]/20 border-[#00d4ff]/40 text-[#00d4ff]'
            : 'bg-white/10 border-white/20 text-white/60'
        }`}
      >
        <MapPin size={24} />
      </button>

      {/* Current Street Name */}
      {gpsData.connected && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-2xl px-6 py-3 rounded-xl border border-white/20 shadow-xl">
            <div className="text-white/80 text-sm">
              Lat: {gpsData.latitude.toFixed(6)} • Lng: {gpsData.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      {/* Download Dialog - Tesla Style */}
      <AnimatePresence>
        {showDownloadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 max-w-2xl mx-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin size={32} className="text-[#00d4ff]" />
                  <div>
                    <h2 className="text-3xl font-light text-white">Navigation</h2>
                    <p className="text-sm text-white/60">Choose map tile source</p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Online Maps */}
                <button
                  onClick={() => handleTileSourceSelect('online')}
                  className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 rounded-2xl p-6 transition-all active:scale-95"
                >
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 rounded-full border-2 border-white/40 group-hover:border-[#00d4ff] transition-colors" />
                  </div>
                  <Download size={40} className="text-blue-400 mb-3" />
                  <h3 className="text-xl font-medium text-white mb-2">Online Maps</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Always up-to-date from OpenStreetMap
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Free</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Internet Required</span>
                  </div>
                </button>

                {/* Offline Maps */}
                <button
                  onClick={() => handleTileSourceSelect('offline')}
                  className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 rounded-2xl p-6 transition-all active:scale-95"
                >
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 rounded-full border-2 border-white/40 group-hover:border-[#00d4ff] transition-colors" />
                  </div>
                  <MapPin size={40} className="text-purple-400 mb-3" />
                  <h3 className="text-xl font-medium text-white mb-2">Offline Maps</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Pre-downloaded tiles (Thailand)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Works Offline</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">~10-15 GB</span>
                  </div>
                </button>
              </div>

              {/* Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-yellow-400 mt-0.5">
                    <Download size={18} />
                  </div>
                  <div className="text-sm text-white/70">
                    <strong className="text-white">Tip:</strong> Online maps work anywhere with internet.
                    Download offline maps for areas you frequent to save data and work without connection.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
