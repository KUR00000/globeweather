import { useGlobeStore } from '../store/useGlobeStore'
import { secondsToHoursMinutes } from '../globe/utils'

export function SolarPanel() {
  const solarData = useGlobeStore(state => state.solarData)
  const loading = useGlobeStore(state => state.loading)

  const daily = solarData?.daily

  if (!daily?.time?.length && !loading) return null

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const sunshinePercent = (daily?.sunshine_duration && daily?.daylight_duration)
    ? Math.round((daily.sunshine_duration[0] / daily.daylight_duration[0]) * 100)
    : 0

  return (
    <div className="panel-hud visible" style={{ width: 240 }}>
      <div className="panel-header">☀️ SOLAR & DAYLIGHT</div>
      <div className="panel-content">
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="loading-shimmer" style={{ height: 32 }} />
            <div className="loading-shimmer" style={{ height: 16, width: '60%' }} />
          </div>
        )}

        {!loading && daily?.time?.length && (
          <>
            {/* UV Index */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {daily.uv_index_max[0].toFixed(1)}
              </div>
              <div style={{ fontSize: 10, color: '#5a8a9a', letterSpacing: 2, marginTop: 2 }}>
                UV INDEX TODAY
              </div>
            </div>

            <div className="section-divider" />

            {/* Sunrise / Sunset */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <div>
                <div className="label">🌅 SUNRISE</div>
                <div className="value">
                  {daily.sunrise ? formatTime(daily.sunrise[0]) : '—'}
                </div>
              </div>
              <div>
                <div className="label">🌇 SUNSET</div>
                <div className="value">
                  {daily.sunset ? formatTime(daily.sunset[0]) : '—'}
                </div>
              </div>
            </div>

            <div className="section-divider" style={{ margin: '8px 0' }} />

            {/* Daylight */}
            <div>
              <div className="label">DAYLIGHT</div>
              <div className="value" style={{ marginBottom: 4 }}>
                {daily.daylight_duration
                  ? secondsToHoursMinutes(daily.daylight_duration[0])
                  : '—'}
              </div>
            </div>

            {/* Sunshine bar */}
            <div>
              <div className="label">SUNSHINE</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 4
              }}>
                <div style={{
                  flex: 1,
                  height: 6,
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${sunshinePercent}%`,
                    background: 'linear-gradient(90deg, #ff9500, #ffcc00)',
                    borderRadius: 3,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span className="value" style={{ fontSize: 12 }}>{sunshinePercent}%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}