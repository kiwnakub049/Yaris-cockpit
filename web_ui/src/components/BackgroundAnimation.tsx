import { motion } from 'framer-motion'
import { useBackground } from '../contexts/BackgroundContext'
import { useTheme } from '../contexts/ThemeContext'

export default function BackgroundAnimation() {
  const { backgroundStyle } = useBackground()
  const { isDarkMode } = useTheme()

  if (backgroundStyle === 'gradient-wave') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className={`absolute inset-0 ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20'
              : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
          }`}
          animate={{
            background: isDarkMode
              ? [
                  'linear-gradient(to bottom right, #111827, rgba(30, 58, 138, 0.2), rgba(88, 28, 135, 0.2))',
                  'linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), #111827, rgba(88, 28, 135, 0.2))',
                  'linear-gradient(to bottom right, rgba(88, 28, 135, 0.3), rgba(30, 58, 138, 0.2), #111827)',
                  'linear-gradient(to bottom right, #111827, rgba(30, 58, 138, 0.2), rgba(88, 28, 135, 0.2))',
                ]
              : [
                  'linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)',
                  'linear-gradient(to bottom right, #faf5ff, #fdf2f8, #eff6ff)',
                  'linear-gradient(to bottom right, #fdf2f8, #eff6ff, #faf5ff)',
                  'linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)',
                ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    )
  }

  if (backgroundStyle === 'aurora-flow') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-300 dark:bg-tesla-black">
        <motion.div
          className={`absolute w-[200%] h-[200%] -top-1/2 -left-1/2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20'
              : 'bg-gradient-to-r from-blue-300/40 via-purple-300/40 to-pink-300/40'
          } blur-3xl`}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className={`absolute w-[200%] h-[200%] -bottom-1/2 -right-1/2 ${
            isDarkMode
              ? 'bg-gradient-to-l from-cyan-600/20 via-teal-600/20 to-emerald-600/20'
              : 'bg-gradient-to-l from-cyan-300/40 via-teal-300/40 to-emerald-300/40'
          } blur-3xl`}
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    )
  }

  if (backgroundStyle === 'particles-drift') {
    const particleCount = 20
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 20 + 15,
    }))

    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-300 dark:bg-tesla-black">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                : 'bg-gradient-to-br from-blue-200/30 to-purple-200/30'
            } blur-xl`}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    )
  }

  return null
}
