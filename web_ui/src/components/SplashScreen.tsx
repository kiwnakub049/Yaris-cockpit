import { motion } from 'framer-motion'
import { Gauge } from 'lucide-react'

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900"
    >
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-12"
        >
          <div className="relative">
            {/* Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-40 h-40 rounded-full border-2 border-red-500/30 border-t-red-500" />
            </motion.div>

            {/* Icon */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <Gauge 
                size={80} 
                strokeWidth={1.5} 
                className="text-red-500" 
              />
            </div>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-center"
        >
          <h1 className="text-6xl font-light text-white tracking-wider mb-3">
            YARIS
          </h1>
          <p className="text-sm text-white/50 uppercase tracking-widest">
            Cockpit System
          </p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '200px', opacity: 1 }}
          transition={{ 
            duration: 1.5, 
            delay: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mt-16 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 rounded-full"
        />

        {/* Version Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 text-xs text-white/30 tracking-wider"
        >
          v2.0.0 • Initializing...
        </motion.p>
      </div>
    </motion.div>
  )
}
