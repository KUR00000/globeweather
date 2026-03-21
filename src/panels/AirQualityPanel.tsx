import { useGlobeStore } from '../store/useGlobeStore'
import { aqiToCategory } from '../globe/utils'
import { Wind, Activity, Zap, Waves } from 'lucide-react'

export function AirQualityPanel() {
  const airData = useGlobeStore(state => state.airData)
  const loading = useGlobeStore(state => state.loading)

  const current = airData?.current
  const aqiInfo = current ? aqiToCategory(current.us_aqi) : null

  if (!current && !loading) return null

  return (
    <div className="panel-hud visible">
      <div className="panel-header">
        <Wind size={14} className="mr-2" /> AIR QUALITY
      </div>
      <div className="panel-content">
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="loading-shimmer h-10 w-full" />
            <div className="loading-shimmer h-4 w-2/3" />
          </div>
        )}

        {!loading && current && (
          <>
            <div className="flex flex-col items-center mb-2">
              <div
                className="hero-value leading-none"
                style={{ color: aqiInfo?.color || '#a0f0ff' }}
              >
                {Math.round(current.us_aqi)}
              </div>
              <div className="label mt-1 text-[#5a8a9a]">US AQI</div>
            </div>

            {/* AQI Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, (current.us_aqi / 500) * 100)}%`,
                  background: aqiInfo?.color || '#00d4ff'
                }}
              />
            </div>
            <div
              className="text-center text-xs font-bold mb-3 uppercase tracking-wider"
              style={{ color: aqiInfo?.color || '#a0f0ff' }}
            >
              {aqiInfo?.category}
            </div>

            <div className="section-divider" />

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Activity size={10} /> PM2.5
                </div>
                <div className="value text-[13px]">{current.pm2_5.toFixed(1)} <span className="text-[9px] opacity-40">µg/m³</span></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Activity size={10} /> PM10
                </div>
                <div className="value text-[13px]">{current.pm10.toFixed(1)} <span className="text-[9px] opacity-40">µg/m³</span></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Zap size={10} /> OZONE
                </div>
                <div className="value text-[13px]">{current.ozone.toFixed(1)} <span className="text-[9px] opacity-40">µg/m³</span></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Waves size={10} /> NO₂
                </div>
                <div className="value text-[13px]">{current.nitrogen_dioxide.toFixed(1)} <span className="text-[9px] opacity-40">µg/m³</span></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}