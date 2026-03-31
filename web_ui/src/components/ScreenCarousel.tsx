import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'

interface Page {
  id: number
  name: string
  component: React.ReactNode
}

interface ScreenCarouselProps {
  pages: Page[]
  currentPage: number
  onPageChange: (direction: 'left' | 'right') => void
}

export default function ScreenCarousel({ pages, currentPage, onPageChange }: ScreenCarouselProps) {
  const handlers = useSwipeable({
    onSwipedLeft: () => onPageChange('right'), // Swipe left = next page (right)
    onSwipedRight: () => onPageChange('left'), // Swipe right = prev page (left)
    trackMouse: false,
    trackTouch: true,
    delta: 75, // 75px threshold
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false },
  })

  const slideVariants = {
    enter: {
      opacity: 0,
      filter: 'blur(8px)',
      scale: 1.02,
    },
    center: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
    },
    exit: {
      opacity: 0,
      filter: 'blur(8px)',
      scale: 0.98,
    },
  }

  const springTransition = {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1], // Custom easing for premium feel
  }

  return (
    <div
      {...handlers}
      className="w-full h-full relative overflow-hidden"
      style={{ 
        transform: 'translateZ(0)',
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentPage}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className="absolute inset-0 w-full h-full"
          style={{ 
            willChange: 'opacity, filter, transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {pages[currentPage].component}
        </motion.div>
      </AnimatePresence>

      {/* Page Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentPage
                ? 'w-8 bg-white'
                : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
