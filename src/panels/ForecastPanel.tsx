import { useGlobeStore } from '../store/useGlobeStore'
import { wmoCodeToDescription, getDayName } from '../globe/utils'

export function ForecastPanel() {
  const forecastData = useGlobeStore(state => state.forecastData)
  const loading = useGlobeStore(state => state.loading)

  const daily = forecastData?.daily

  if (!daily && !loading) return null

  const formatDay = (dateString: string, index: number) => {
    if (index === 0) return 'TODAY'
    return getDayName(dateString)
  }

  // Get global temp range for bar positioning
  const allTemps = daily
    ? [...daily.temperature_2m_min, ...daily.temperature_2m_max]
    : []
  const globalMin = allTemps.length > 0 ? Math.min(...allTemps) : 0
  const globalMax = allTemps.length > 0 ? Math.max(...allTemps) : 30
  const range = globalMax - globalMin || 1

  return (
    <div className="panel-hud visible" style={{ width: 320 }}>
      <div className="panel-header">📅 7-DAY FORECAST</div>
      <div className="panel-content" style={{ padding: '8px 12px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="loading-shimmer" style={{ height: 28 }} />
            ))}
          </div>
        )}

        {!loading && daily && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {daily.time.map((date, index) => {
              const weather = wmoCodeToDescription(daily.weathercode[index])
              const minTemp = daily.temperature_2m_min[index]
              const maxTemp = daily.temperature_2m_max[index]
              const rainProb = daily.precipitation_probability_max[index]

              // Calculate bar position within the global range
              const left = ((minTemp - globalMin) / range) * 100
              const width = ((maxTemp - minTemp) / range) * 100

              return (
                <div
                  key={date}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 4px',
                    borderRadius: 4,
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }}
                >
                  {/* Day name */}
                  <div style={{ width: 42, fontSize: 10, fontWeight: 600, color: index === 0 ? '#00d4ff' : '#7aa0b0', letterSpacing: 1 }}>
                    {formatDay(date, index)}
                  </div>

                  {/* Weather icon */}
                  <div style={{ width: 24, textAlign: 'center', fontSize: 16 }}>
                    {weather?.icon}
                  </div>

                  {/* Min temp */}
                  <div style={{ width: 30, fontSize: 11, color: '#6a9aaa', textAlign: 'right' }}>
                    {Math.round(minTemp)}°
                  </div>

                  {/* Temperature bar */}
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${Math.max(width, 4)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0077cc, #ff4444)',
                      borderRadius: 3,
                      transition: 'all 0.4s ease'
                    }} />
                  </div>

                  {/* Max temp */}
                  <div style={{ width: 30, fontSize: 11, color: '#c8f4ff', fontWeight: 600 }}>
                    {Math.round(maxTemp)}°
                  </div>

                  {/* Rain probability */}
                  <div style={{
                    width: 32,
                    fontSize: 10,
                    textAlign: 'right',
                    color: rainProb > 50 ? '#00aaff' : '#4a6a7a'
                  }}>
                    {rainProb > 0 ? `${rainProb}%` : ''}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}