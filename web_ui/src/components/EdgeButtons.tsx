import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface EdgeButtonsProps {
  onNavigate: (direction: 'left' | 'right') => void
}

export default function EdgeButtons({ onNavigate }: EdgeButtonsProps) {
  const [showButtons, setShowButtons] = useState(true)

  useEffect(() => {
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setShowButtons(false)
    }, 3000)

    // Show buttons on any mouse movement or touch
    const handleActivity = () => {
      setShowButtons(true)
      clearTimeout(timer)
      setTimeout(() => setShowButtons(false), 3000)
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [])

  const buttonClass = `
    absolute top-1/2 -translate-y-1/2 z-40
    w-20 h-48
    glass-dark
    flex items-center justify-center
    cursor-pointer
    transition-all duration-150
    active:bg-white/10
    active:scale-95
  `

  return (
    <>
      {/* Left Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: showButtons ? 1 : 0,
          x: showButtons ? 0 : -20,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={() => onNavigate('left')}
        className={`${buttonClass} left-0 rounded-r-2xl`}
        aria-label="Previous page"
        style={{ willChange: 'transform, opacity' }}
      >
        <svg
          className="w-8 h-8 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </motion.button>

      {/* Right Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: showButtons ? 1 : 0,
          x: showButtons ? 0 : 20,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={() => onNavigate('right')}
        className={`${buttonClass} right-0 rounded-l-2xl`}
        aria-label="Next page"
        style={{ willChange: 'transform, opacity' }}
      >
        <svg
          className="w-8 h-8 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.button>
    </>
  )
}
