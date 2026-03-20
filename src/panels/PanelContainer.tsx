import { useRef } from 'react'
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion'
import { useGlobeStore } from '../store/useGlobeStore'
import { ForecastPanel } from './ForecastPanel'
import { WeatherPanel } from './WeatherPanel'
import { AirQualityPanel } from './AirQualityPanel'
import { AtmospherePanel } from './AtmospherePanel'
import { SolarPanel } from './SolarPanel'

const PANEL_IDS = ['solar', 'atmosphere', 'weather', 'air', 'forecast']

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
  const lineRefs = useRef<Record<string, SVGLineElement | null>>({})
  const circleRefs = useRef<Record<string, SVGCircleElement | null>>({})

  // High-performance 60fps loop for SVG anchors
  useAnimationFrame(() => {
    if (!panelsVisible) return
    const cityPos = useGlobeStore.getState().cityScreenPos
    if (!cityPos) return

    for (const id of PANEL_IDS) {
      const el = panelRefs.current[id]
      if (!el) continue

      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue

      let targetX = rect.left + rect.width / 2
      let targetY = rect.top + rect.height / 2

      if (id === 'solar') { targetX = rect.right; targetY = rect.bottom; }
      else if (id === 'atmosphere') { targetX = rect.right; targetY = rect.top; }
      else if (id === 'weather') { targetX = rect.left; targetY = rect.top + rect.height / 2; }
      else if (id === 'air') { targetX = rect.left; targetY = rect.top; }
      else if (id === 'forecast') { targetX = rect.left + rect.width / 2; targetY = rect.top; }

      // We use polylineRefs now instead of lineRefs
      const polylineEl = (lineRefs as any).current[id]
      if (polylineEl) {
        if (id === 'weather') {
          // L-shaped elbow for Weather
          const midX = (cityPos.x + targetX) / 2
          polylineEl.setAttribute('points', `${cityPos.x},${cityPos.y} ${midX},${targetY} ${targetX},${targetY}`)
        } else {
          // Straight line for others
          polylineEl.setAttribute('points', `${cityPos.x},${cityPos.y} ${targetX},${targetY}`)
        }
      }

      const circleEl = circleRefs.current[id]
      if (circleEl) {
        circleEl.setAttribute('cx', targetX.toString())
        circleEl.setAttribute('cy', targetY.toString())
      }
    }
  })

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
          {panelsVisible && cityScreenPos && (
            <>
              {PANEL_IDS.map((id, i) => (
                <g key={id}>
                  <motion.polyline
                    ref={(el) => { (lineRefs as any).current[id] = el }}
                    stroke="#00d4ff"
                    strokeWidth="1"
                    strokeDasharray="6 3"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: 0.75,
                      strokeDashoffset: [0, -18],
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
                  <motion.circle
                    ref={(el) => { (circleRefs as any).current[id] = el }}
                    r="4"
                    fill="#00d4ff"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 + 0.3, type: 'spring' }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  />
                </g>
              ))}

              {/* City origin dot with CSS pulse */}
              <circle cx={cityScreenPos.x} cy={cityScreenPos.y} r="7" fill="#ffffff" />
              <motion.circle
                cx={cityScreenPos.x}
                cy={cityScreenPos.y}
                r="7"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
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
            className="city-tooltip"
            style={{
              left: cityScreenPos.x,
              top: cityScreenPos.y - 32,
              transform: 'translateX(-50%)'
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
            {/* 1. Solar & Daylight */}
            <motion.div
              custom={0} variants={panelVariants} initial="hidden" animate="visible" exit="exit"
              className="panel-solar"
              style={{ position: 'fixed', left: 20, top: 72, zIndex: 10 }}
            >
              <div ref={el => { panelRefs.current['solar'] = el }}><SolarPanel /></div>
            </motion.div>

            {/* 2. Atmosphere */}
            <motion.div
              custom={1} variants={panelVariants} initial="hidden" animate="visible" exit="exit"
              className="panel-atmosphere"
              style={{ position: 'fixed', left: 20, bottom: 100, zIndex: 10 }}
            >
              <div ref={el => { panelRefs.current['atmosphere'] = el }}><AtmospherePanel /></div>
            </motion.div>

            {/* 3. Weather Data */}
            <motion.div
              custom={2} variants={panelVariants} initial="hidden" animate="visible" exit="exit"
              className="panel-weather"
              style={{ position: 'fixed', right: 20, top: 72, zIndex: 10 }}
            >
              <div ref={el => { panelRefs.current['weather'] = el }}><WeatherPanel /></div>
            </motion.div>

            {/* 4. Air Quality */}
            <motion.div
              custom={3} variants={panelVariants} initial="hidden" animate="visible" exit="exit"
              className="panel-air"
              style={{ position: 'fixed', right: 20, bottom: 100, zIndex: 10 }}
            >
              <div ref={el => { panelRefs.current['air'] = el }}><AirQualityPanel /></div>
            </motion.div>

            {/* 5. 7-Day Forecast */}
            <motion.div
              custom={4} variants={panelVariants} initial="hidden" animate="visible" exit="exit"
              className="panel-forecast"
              style={{ position: 'fixed', left: '50%', x: '-50%', bottom: 20, zIndex: 10 }}
            >
              <div ref={el => { panelRefs.current['forecast'] = el }}><ForecastPanel /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}