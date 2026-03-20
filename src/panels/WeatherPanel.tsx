import { useGlobeStore } from '../store/useGlobeStore'
import { wmoCodeToDescription, uvIndexToRisk } from '../globe/utils'

export function WeatherPanel() {
  const weatherData = useGlobeStore(state => state.weatherData)
  const loading = useGlobeStore(state => state.loading)

  const current = weatherData?.current
  const weatherDesc = current ? wmoCodeToDescription(current.weathercode) : null
  const uvRisk = current ? uvIndexToRisk(current.uv_index) : null

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return directions[Math.round(degrees / 45) % 8]
  }

  if (!current && !loading) return null

  return (
    <div className="panel-hud visible" style={{ width: 280 }}>
      <div className="panel-header">☀️ WEATHER DATA</div>
      <div className="panel-content">
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="loading-shimmer" style={{ height: 32 }} />
            <div className="loading-shimmer" style={{ height: 16, width: '60%' }} />
          </div>
        )}

        {!loading && current && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{weatherDesc?.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {Math.round(current.temperature_2m)}°C
              </div>
              <div style={{ fontSize: 11, color: '#00d4ff', letterSpacing: 2, marginTop: 2 }}>
                {weatherDesc?.description?.toUpperCase() || 'UNKNOWN'}
              </div>
            </div>

            <div className="section-divider" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginTop: 6 }}>
              <div>
                <div className="label">FEELS LIKE</div>
                <div className="value">{Math.round(current.apparent_temperature)}°C</div>
              </div>
              <div>
                <div className="label">PRECIPITATION</div>
                <div className="value">{current.precipitation.toFixed(1)} mm</div>
              </div>
              <div>
                <div className="label">WIND</div>
                <div className="value">
                  {current.windspeed_10m.toFixed(0)} km/h {getWindDirection(current.winddirection_10m)}
                </div>
              </div>
              <div>
                <div className="label">UV INDEX</div>
                <div className="value">
                  {current.uv_index.toFixed(1)}{' '}
                  <span style={{ fontSize: 10, color: '#5a8a9a' }}>({uvRisk})</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}