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

  return (
    <div className="panel-hud visible" style={{ width: 'auto', minWidth: 600, maxWidth: '90vw' }}>
      <div className="panel-header" style={{ justifyContent: 'center' }}>
        📅 7-DAY FORECAST
      </div>
      <div className="panel-content" style={{ padding: '16px 20px' }}>
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="loading-shimmer" style={{ height: 80, borderRadius: 12 }} />
            ))}
          </div>
        )}

        {!loading && daily && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {daily.time.map((date, index) => {
              const weather = wmoCodeToDescription(daily.weathercode[index])
              const minTemp = daily.temperature_2m_min[index]
              const maxTemp = daily.temperature_2m_max[index]
              const rainProb = daily.precipitation_probability_max[index]

              return (
                <div
                  key={date}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 16,
                    padding: '12px 16px',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0, 229, 255, 0.08)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0, 229, 255, 0.3)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0, 0, 0, 0.4)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Rain Probability Background Height */}
                  {rainProb > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: `${rainProb}%`,
                      background: 'linear-gradient(0deg, rgba(0, 229, 255, 0.15) 0%, transparent 100%)',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }} />
                  )}

                  <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {/* Day name */}
                    <div style={{ 
                      fontFamily: 'Space Mono', 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: index === 0 ? '#00e5ff' : '#6c8a9c', 
                      letterSpacing: 2,
                      marginBottom: 8
                    }}>
                      {formatDay(date, index)}
                    </div>

                    {/* Weather icon */}
                    <div style={{ fontSize: 28, marginBottom: 8, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                      {weather?.icon}
                    </div>

                    {/* Temperatures */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                        {Math.round(maxTemp)}°
                      </span>
                      <span style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 500, color: '#6c8a9c' }}>
                        {Math.round(minTemp)}°
                      </span>
                    </div>

                    {/* Rain probability text */}
                    <div style={{ 
                      fontFamily: 'Space Mono', 
                      fontSize: 10, 
                      color: rainProb > 20 ? '#00e5ff' : '#4a6b7c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span style={{ fontSize: 10 }}>💧</span>
                      {rainProb}%
                    </div>
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