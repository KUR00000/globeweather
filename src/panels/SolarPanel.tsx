import { useGlobeStore } from '../store/useGlobeStore'
import { secondsToHoursMinutes } from '../globe/utils'
import { Sun, Sunrise, Sunset, Clock, Zap } from 'lucide-react'

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
      <div className="panel-header">
        <Sun size={14} className="mr-2" /> SOLAR & DAYLIGHT
      </div>
      <div className="panel-content">
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="loading-shimmer h-10 w-full" />
            <div className="loading-shimmer h-4 w-2/3" />
          </div>
        )}

        {!loading && daily?.time?.length && (
          <>
            {/* UV Index */}
            <div className="flex flex-col items-center mb-2">
              <div className="hero-value leading-none">
                {daily.uv_index_max[0].toFixed(1)}
              </div>
              <div className="label mt-1 text-[#5a8a9a] text-[9px] tracking-[0.15em]">
                UV INDEX TODAY
              </div>
            </div>

            <div className="section-divider" />

            {/* Sunrise / Sunset */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Sunrise size={10} /> SUNRISE
                </div>
                <div className="value text-[13px]">
                  {daily.sunrise ? formatTime(daily.sunrise[0]) : '—'}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Sunset size={10} /> SUNSET
                </div>
                <div className="value text-[13px]">
                  {daily.sunset ? formatTime(daily.sunset[0]) : '—'}
                </div>
              </div>
            </div>

            <div className="section-divider my-2" />

            {/* Daylight */}
            <div className="flex flex-col mb-3">
              <div className="flex items-center gap-1.5 label mb-1">
                <Clock size={10} /> DAYLIGHT
              </div>
              <div className="value text-[14px]">
                {daily.daylight_duration
                  ? secondsToHoursMinutes(daily.daylight_duration[0])
                  : '—'}
              </div>
            </div>

            {/* Sunshine bar */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 label mb-1">
                <Zap size={10} /> SUNSHINE
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${sunshinePercent}%`,
                      background: 'linear-gradient(90deg, #ff9500, #ffcc00)'
                    }}
                  />
                </div>
                <span className="value text-xs">{sunshinePercent}%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}