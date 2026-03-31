import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'

export default function CarPlayPage() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full flex flex-col items-center justify-center bg-gray-300 dark:bg-tesla-black transition-colors duration-300"
      style={{ willChange: 'opacity, filter' }}
    >
      {/* CarPlay Container (would show video stream in production) */}
      <div className="w-full h-full glass-card m-8 rounded-3xl overflow-hidden relative">
        {/* Placeholder when no CarPlay connected */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <Smartphone size={128} strokeWidth={1} className="mx-auto mb-8 text-gray-400 dark:text-white/20 transition-colors" />
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white/80 transition-colors">CarPlay Not Connected</h2>
            <p className="text-gray-600 dark:text-white/40 mb-8 max-w-md transition-colors">
              Connect your iPhone via Carlinkit to access navigation, calls, and apps
            </p>
            
            {/* Instructions */}
            <div className="glass-dark px-8 py-6 rounded-2xl inline-block">
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">1</span>
                  </div>
                  <span className="text-white/60">Connect Carlinkit device via USB</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">2</span>
                  </div>
                  <span className="text-gray-700 dark:text-white/60 transition-colors">Plug iPhone into Carlinkit</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">3</span>
                  </div>
                  <span className="text-gray-700 dark:text-white/60 transition-colors">CarPlay will appear automatically</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Video Stream Placeholder (will be replaced with actual video in production) */}
        {/* <video className="w-full h-full object-cover" /> */}
      </div>
    </motion.div>
  )
}
