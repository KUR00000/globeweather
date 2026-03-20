import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGlobeStore } from '../store/useGlobeStore'

export function HintText() {
  const [isVisible, setIsVisible] = useState(true)
  const selectedCity = useGlobeStore(state => state.selectedCity)

  useEffect(() => {
    if (selectedCity) {
      // Start fade out animation after first city selection
      const timeout = setTimeout(() => {
        setIsVisible(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [selectedCity])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-hud-cyan text-xs uppercase tracking-wider opacity-70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          CLICK ANY CITY TO INSPECT
        </motion.div>
      )}
    </AnimatePresence>
  )
}