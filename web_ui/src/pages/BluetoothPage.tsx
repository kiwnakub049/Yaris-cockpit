import { motion } from 'framer-motion'
import { useState } from 'react'
import { Music2, SkipBack, SkipForward, Play, Pause, Bluetooth } from 'lucide-react'

export default function BluetoothPage() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-300 via-gray-400 to-blue-200 dark:from-blue-950/30 dark:via-tesla-black dark:to-tesla-black transition-colors duration-300"
      style={{ willChange: 'opacity, filter' }}
    >
      {/* Album Art */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card w-96 h-96 rounded-3xl mb-12 flex items-center justify-center overflow-hidden"
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Music2 size={128} strokeWidth={1} className="text-white/30" />
        </div>
      </motion.div>

      {/* Track Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white transition-colors">Unknown Track</h2>
        <p className="text-xl text-gray-600 dark:text-white/50 transition-colors">No Artist</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="glass-dark h-2 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-blue-400" />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-white/40 transition-colors">
          <span>1:24</span>
          <span>3:45</span>
        </div>
      </div>

      {/* Control Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-8"
      >
        {/* Previous */}
        <button className="glass-card w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
          <SkipBack size={32} strokeWidth={1.5} className="text-gray-700 dark:text-white" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="glass-card w-24 h-24 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30"
        >
          {isPlaying ? (
            <Pause size={48} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400" />
          ) : (
            <Play size={48} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400 ml-1" />
          )}
        </button>

        {/* Next */}
        <button className="glass-card w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
          <SkipForward size={32} strokeWidth={1.5} className="text-gray-700 dark:text-white" />
        </button>
      </motion.div>

      {/* Connection Status */}
      <div className="absolute bottom-20 glass-card px-6 py-3 rounded-xl">
        <div className="flex items-center gap-3">
          <Bluetooth size={16} className="text-blue-500 animate-pulse" />
          <span className="text-gray-700 dark:text-white/70 transition-colors">Connected to iPhone</span>
        </div>
      </div>
    </motion.div>
  )
}
