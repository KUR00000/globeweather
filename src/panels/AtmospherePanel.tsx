import { useGlobeStore } from '../store/useGlobeStore'
import { pressureToRelative } from '../globe/utils'

export function AtmospherePanel() {
  const atmosphereData = useGlobeStore(state => state.atmosphereData)
  const loading = useGlobeStore(state => state.loading)

  const current = atmosphereData?.current

  if (!current && !loading) return null

  return (
    <div className="panel-hud visible" style={{ width: 260 }}>
      <div className="panel-header">🌐 ATMOSPHERE</div>
      <div className="panel-content">
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="loading-shimmer" style={{ height: 32 }} />
            <div className="loading-shimmer" style={{ height: 16, width: '60%' }} />
          </div>
        )}

        {!loading && current && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {/* Humidity */}
              <div>
                <div className="label">HUMIDITY</div>
                <div className="value">{Math.round(current.relativehumidity_2m)}%</div>
                <div style={{
                  width: '100%',
                  height: 4,
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 4
                }}>
                  <div style={{
                    height: '100%',
                    width: `${current.relativehumidity_2m}%`,
                    background: '#00d4ff',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Dew Point */}
              <div>
                <div className="label">DEW POINT</div>
                <div className="value">{current.dewpoint_2m.toFixed(1)}°C</div>
              </div>

              {/* Cloud Cover */}
              <div>
                <div className="label">CLOUD COVER</div>
                <div className="value">{Math.round(current.cloudcover)}%</div>
                <div style={{
                  width: '100%',
                  height: 4,
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 4
                }}>
                  <div style={{
                    height: '100%',
                    width: `${current.cloudcover}%`,
                    background: '#7a8aaa',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <div className="label">VISIBILITY</div>
                <div className="value">{(current.visibility / 1000).toFixed(1)} km</div>
              </div>
            </div>

            <div className="section-divider" style={{ margin: '10px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div>
                <div className="label">PRESSURE</div>
                <div className="value">
                  {current.surface_pressure.toFixed(0)} hPa
                </div>
                <div style={{ fontSize: 10, color: '#5a8a9a' }}>
                  ({pressureToRelative(current.surface_pressure)})
                </div>
              </div>
              <div>
                <div className="label">RAIN PROB.</div>
                <div className="value">{current.precipitation_probability ?? 0}%</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}