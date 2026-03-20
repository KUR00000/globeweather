import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGlobeStore } from '../store/useGlobeStore'
import { ForecastPanel } from './ForecastPanel'
import { WeatherPanel } from './WeatherPanel'
import { AirQualityPanel } from './AirQualityPanel'
import { AtmospherePanel } from './AtmospherePanel'
import { SolarPanel } from './SolarPanel'

interface PanelPosition {
  id: string
  x: number
  y: number
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 260,
      damping: 22
    }
  }),
  exit: { opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } }
}

export function PanelContainer() {
  const selectedCity = useGlobeStore(state => state.selectedCity)
  const cityScreenPos = useGlobeStore(state => state.cityScreenPos)
  const panelsVisible = useGlobeStore(state => state.panelsVisible)
  const loading = useGlobeStore(state => state.loading)

  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [panelCenters, setPanelCenters] = useState<PanelPosition[]>([])

  useEffect(() => {
    if (!panelsVisible) return

    const updateCenters = () => {
      const centers: PanelPosition[] = []
      for (const [id, el] of Object.entries(panelRefs.current)) {
        if (el) {
          const rect = el.getBoundingClientRect()
          centers.push({
            id,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          })
        }
      }
      setPanelCenters(centers)
    }

    const timer = setTimeout(updateCenters, 400)
    window.addEventListener('resize', updateCenters)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCenters)
    }
  }, [panelsVisible, selectedCity])

  if (!selectedCity && !loading) return null

  return (
    <>
      {/* SVG Connector Lines */}
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 50
        }}
      >
        <AnimatePresence>
          {panelsVisible && cityScreenPos && panelCenters.length > 0 && (
            <>
              {panelCenters.map((panel, i) => (
                <motion.line
                  key={panel.id}
                  x1={cityScreenPos.x}
                  y1={cityScreenPos.y}
                  x2={panel.x}
                  y2={panel.y}
                  stroke="rgba(0, 212, 255, 0.35)"
                  strokeWidth={1}
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 0.6,
                    strokeDashoffset: [-20, 0],
                    transition: {
                      pathLength: { delay: i * 0.08, duration: 0.4 },
                      opacity: { delay: i * 0.08, duration: 0.3 },
                      strokeDashoffset: {
                        delay: i * 0.08 + 0.4,
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear'
                      }
                    }
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                />
              ))}

              {/* City pulse dot */}
              <motion.circle
                cx={cityScreenPos.x}
                cy={cityScreenPos.y}
                r={6}
                fill="none"
                stroke="#00ffff"
                strokeWidth={2}
                initial={{ r: 4, opacity: 0 }}
                animate={{
                  r: [6, 14, 6],
                  opacity: [0.9, 0.2, 0.9],
                  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              />
              <motion.circle
                cx={cityScreenPos.x}
                cy={cityScreenPos.y}
                r={3}
                fill="#00ffff"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            </>
          )}
        </AnimatePresence>
      </svg>

      {/* City Name Label */}
      <AnimatePresence>
        {panelsVisible && selectedCity && cityScreenPos && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              left: cityScreenPos.x,
              top: cityScreenPos.y - 28,
              transform: 'translateX(-50%)',
              zIndex: 200,
              pointerEvents: 'none',
              background: 'rgba(0, 8, 18, 0.9)',
              border: '1px solid rgba(0, 212, 255, 0.5)',
              borderRadius: 4,
              padding: '3px 10px',
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#00d4ff',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)'
            }}
          >
            {selectedCity.n}, {selectedCity.c}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Panels — LEFT column (scrollable) */}
      <AnimatePresence>
        {panelsVisible && (
          <>
            <motion.div
              custom={0}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed',
                left: 12,
                top: 50,
                zIndex: 100,
                maxHeight: 'calc(100vh - 60px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'none',
              }}
            >
              <div ref={el => { panelRefs.current['solar'] = el }}><SolarPanel /></div>
              <div style={{ height: 4 }} />
              <div ref={el => { panelRefs.current['atmosphere'] = el }}><AtmospherePanel /></div>
            </motion.div>

            {/* RIGHT column (scrollable) */}
            <motion.div
              custom={1}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed',
                right: 12,
                top: 50,
                zIndex: 100,
                maxHeight: 'calc(100vh - 60px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'none',
              }}
            >
              <div ref={el => { panelRefs.current['weather'] = el }}><WeatherPanel /></div>
              <div style={{ height: 4 }} />
              <div ref={el => { panelRefs.current['air'] = el }}><AirQualityPanel /></div>
              <div style={{ height: 4 }} />
              <div ref={el => { panelRefs.current['forecast'] = el }}><ForecastPanel /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}