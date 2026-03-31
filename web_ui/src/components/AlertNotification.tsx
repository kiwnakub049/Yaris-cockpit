import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame, Droplet, Fuel, AlertTriangle, CheckCircle, Wrench } from 'lucide-react'
import { useAlerts, Alert, AlertIcon } from '../contexts/AlertContext'

const COUNTDOWN_DURATION = 15 // seconds

function AlertCard({ alert }: { alert: Alert }) {
  const { removeAlert } = useAlerts()
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION)

  // Countdown timer
  useEffect(() => {
    if (!alert.autoDismiss) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          removeAlert(alert.id)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [alert.id, alert.autoDismiss, removeAlert])

  const getIcon = (icon: AlertIcon) => {
    const iconProps = { size: 32, strokeWidth: 2.5 }
    switch (icon) {
      case 'flame':
        return <Flame {...iconProps} />
      case 'droplet':
        return <Droplet {...iconProps} />
      case 'fuel':
        return <Fuel {...iconProps} />
      case 'check':
        return <CheckCircle {...iconProps} />
      case 'wrench':
        return <Wrench {...iconProps} />
      default:
        return <AlertTriangle {...iconProps} />
    }
  }

  const getColors = () => {
    switch (alert.type) {
      case 'critical':
        return {
          bg: 'bg-white/10 dark:bg-black/20',
          border: 'border-red-500/30 dark:border-red-400/30',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-gray-900 dark:text-white',
          ring: 'ring-red-500/20 dark:ring-red-400/20',
          progressBg: 'bg-red-500/20 dark:bg-red-400/20',
          progressBar: 'bg-red-600 dark:bg-red-400',
          accent: 'bg-red-500/10 dark:bg-red-500/20'
        }
      case 'warning':
        return {
          bg: 'bg-white/10 dark:bg-black/20',
          border: 'border-orange-500/30 dark:border-orange-400/30',
          icon: 'text-orange-600 dark:text-orange-400',
          text: 'text-gray-900 dark:text-white',
          ring: 'ring-orange-500/20 dark:ring-orange-400/20',
          progressBg: 'bg-orange-500/20 dark:bg-orange-400/20',
          progressBar: 'bg-orange-600 dark:bg-orange-400',
          accent: 'bg-orange-500/10 dark:bg-orange-500/20'
        }
      case 'info':
        return {
          bg: 'bg-white/10 dark:bg-black/20',
          border: 'border-blue-500/30 dark:border-blue-400/30',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-gray-900 dark:text-white',
          ring: 'ring-blue-500/20 dark:ring-blue-400/20',
          progressBg: 'bg-blue-500/20 dark:bg-blue-400/20',
          progressBar: 'bg-blue-600 dark:bg-blue-400',
          accent: 'bg-blue-500/10 dark:bg-blue-500/20'
        }
      case 'success':
        return {
          bg: 'bg-white/10 dark:bg-black/20',
          border: 'border-green-500/30 dark:border-green-400/30',
          icon: 'text-green-600 dark:text-green-400',
          text: 'text-gray-900 dark:text-white',
          ring: 'ring-green-500/20 dark:ring-green-400/20',
          progressBg: 'bg-green-500/20 dark:bg-green-400/20',
          progressBar: 'bg-green-600 dark:bg-green-400',
          accent: 'bg-green-500/10 dark:bg-green-500/20'
        }
    }
  }

  const colors = getColors()
  const progress = (countdown / COUNTDOWN_DURATION) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative overflow-hidden rounded-2xl border-2 ${colors.border}
        ${colors.bg} backdrop-blur-2xl shadow-xl
        ring-4 ${colors.ring}
        min-w-[400px] max-w-[500px]
      `}
    >
      {/* Progress bar */}
      {alert.autoDismiss && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${colors.progressBg}`}>
          <motion.div
            className={`h-full ${colors.progressBar}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 ${colors.icon}`}>
            {getIcon(alert.icon)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
                  {alert.title}
                </h3>
                <p className={`text-base ${colors.text} opacity-90 leading-relaxed`}>
                  {alert.message}
                </p>
              </div>

              {/* Close button */}
              {alert.dismissible && (
                <button
                  onClick={() => removeAlert(alert.id)}
                  className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${colors.text} opacity-70 hover:opacity-100
                    hover:bg-white/20 transition-all
                  `}
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Countdown */}
            {alert.autoDismiss && (
              <div className="mt-4 flex items-center gap-2">
                <div className={`text-sm font-mono ${colors.text} opacity-60`}>
                  Auto-dismiss in {countdown}s
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AlertNotification() {
  const { alerts } = useAlerts()

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-4 pointer-events-none items-center">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <AlertCard alert={alert} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
