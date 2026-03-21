import { useEffect, useRef, useState, useCallback } from 'react'
import { Globe } from './Globe'
import { loadCities } from '../data'
import { useGlobeStore } from '../store/useGlobeStore'
import type { City } from '../data'

interface GlobeCanvasProps {
  className?: string
}

interface HoveredCity {
  city: City
  x: number
  y: number
}

export function GlobeCanvas({ className }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const initRef = useRef(false)

  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingText, setLoadingText] = useState('Initializing...')
  const [hoveredCity, setHoveredCity] = useState<HoveredCity | null>(null)

  const handleCityClick = useCallback(async (city: City, screenPos?: { x: number; y: number }) => {
    const store = useGlobeStore.getState()
    await store.selectCity(city, screenPos, () => {
      if (globeRef.current) {
        globeRef.current.focusCity(city)
      }
    })
  }, [])

  // Sync theme with body class
  const theme = useGlobeStore(state => state.theme)
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }, [theme])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      console.error('[GlobeCanvas] containerRef is null!')
      return
    }

    // Prevent double-init in StrictMode
    if (initRef.current) return
    initRef.current = true

    console.log('[GlobeCanvas] Initializing globe...')

    const globe = new Globe(
      container,
      window.innerWidth,
      window.innerHeight,
      {
        onCityHover: (city: City | null, event?: MouseEvent) => {
          if (city && event) {
            document.body.style.cursor = 'pointer'
            setHoveredCity({ city, x: event.clientX, y: event.clientY })
          } else {
            document.body.style.cursor = 'default'
            setHoveredCity(null)
          }
        },
        onCityClick: handleCityClick
      }
    )
    globeRef.current = globe

    globe.startAnimation()
    console.log('[GlobeCanvas] Animation started')

    // Load cities data
    setLoadingText('Loading city data...')
    loadCities()
      .then(cities => {
        setLoadingText(`Rendering ${cities.length.toLocaleString()} cities...`)
        globe.loadCities(cities)
        useGlobeStore.getState().setCities(cities)
        console.log(`[GlobeCanvas] ${cities.length} cities loaded and rendered`)
        setTimeout(() => setIsLoaded(true), 300)
      })
      .catch(error => {
        console.error('Failed to load cities:', error)
        setIsLoaded(true)
      })

    const handleResize = () => {
      if (globeRef.current) {
        globeRef.current.handleResize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleCityClick])

  return (
    <div className={className} style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
      {/* Canvas container - always in DOM */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              border: '3px solid rgba(0,212,255,0.15)',
              borderTop: '3px solid #00d4ff',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
              marginBottom: 20
            }}
          />
          <div style={{ color: '#00d4ff', fontSize: 14, fontFamily: 'monospace', letterSpacing: 2 }}>
            SENTINEL GLOBE
          </div>
          <div style={{ color: 'rgba(0,212,255,0.6)', fontSize: 12, fontFamily: 'monospace', marginTop: 6 }}>
            {loadingText}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* City hover tooltip */}
      {hoveredCity && (
        <div
          className="city-tooltip"
          style={{
            left: hoveredCity.x + 14,
            top: hoveredCity.y - 14,
          }}
        >
          <span style={{ fontWeight: 600 }}>{hoveredCity.city.n}</span>
          <span style={{ color: '#5a8a9a', marginLeft: 6 }}>{hoveredCity.city.c}</span>
          {hoveredCity.city.p > 100000 && (
            <span style={{ color: '#4a6a7a', marginLeft: 8, fontSize: 10 }}>
              {(hoveredCity.city.p / 1_000_000).toFixed(1)}M
            </span>
          )}
        </div>
      )}
    </div>
  )
}
