import { useGlobeStore } from '../store/useGlobeStore'
import { aqiToCategory } from '../globe/utils'

export function AirQualityPanel() {
  const airData = useGlobeStore(state => state.airData)
  const loading = useGlobeStore(state => state.loading)

  const current = airData?.current
  const aqiInfo = current ? aqiToCategory(current.us_aqi) : null

  if (!current && !loading) return null

  return (
    <div className="panel-hud visible">
      <div className="panel-header">🌬️ AIR QUALITY</div>
      <div className="panel-content">
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="loading-shimmer" style={{ height: 32 }} />
            <div className="loading-shimmer" style={{ height: 16, width: '60%' }} />
          </div>
        )}

        {!loading && current && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: aqiInfo?.color || '#a0f0ff',
                  lineHeight: 1
                }}
              >
                {Math.round(current.us_aqi)}
              </div>
              <div style={{ fontSize: 11, color: '#5a8a9a', letterSpacing: 2, marginTop: 2 }}>US AQI</div>
            </div>

            {/* AQI Bar */}
            <div style={{
              width: '100%',
              height: 6,
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 3,
              overflow: 'hidden',
              marginBottom: 4
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (current.us_aqi / 500) * 100)}%`,
                  background: aqiInfo?.color || '#00d4ff',
                  borderRadius: 3,
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: aqiInfo?.color || '#a0f0ff',
              marginBottom: 8
            }}>
              {aqiInfo?.category}
            </div>

            <div className="section-divider" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <div>
                <div className="label">PM2.5</div>
                <div className="value">{current.pm2_5.toFixed(1)} µg/m³</div>
              </div>
              <div>
                <div className="label">PM10</div>
                <div className="value">{current.pm10.toFixed(1)} µg/m³</div>
              </div>
              <div>
                <div className="label">OZONE (O₃)</div>
                <div className="value">{current.ozone.toFixed(1)} µg/m³</div>
              </div>
              <div>
                <div className="label">NO₂</div>
                <div className="value">{current.nitrogen_dioxide.toFixed(1)} µg/m³</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}