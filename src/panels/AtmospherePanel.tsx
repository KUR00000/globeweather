import { useGlobeStore } from '../store/useGlobeStore'
import { pressureToRelative } from '../globe/utils'
import { Globe, Droplets, Thermometer, Cloud, Eye, Gauge, CloudRain } from 'lucide-react'

export function AtmospherePanel() {
  const atmosphereData = useGlobeStore(state => state.atmosphereData)
  const loading = useGlobeStore(state => state.loading)

  const current = atmosphereData?.current

  if (!current && !loading) return null

  return (
    <div className="panel-hud visible" style={{ width: 260 }}>
      <div className="panel-header">
        <Globe size={14} className="mr-2" /> ATMOSPHERE
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Humidity */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Droplets size={10} /> HUMIDITY
                </div>
                <div className="value text-[14px]">{Math.round(current.relativehumidity_2m)}%</div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-hud-cyan rounded-full transition-[width] duration-500"
                    style={{ width: `${current.relativehumidity_2m}%` }}
                  />
                </div>
              </div>

              {/* Dew Point */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Thermometer size={10} /> DEW POINT
                </div>
                <div className="value text-[14px]">{current.dewpoint_2m.toFixed(1)}°C</div>
              </div>

              {/* Cloud Cover */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Cloud size={10} /> CLOUDS
                </div>
                <div className="value text-[14px]">{Math.round(current.cloudcover)}%</div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-slate-400 rounded-full transition-[width] duration-500"
                    style={{ width: `${current.cloudcover}%` }}
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Eye size={10} /> VISIBILITY
                </div>
                <div className="value text-[14px]">{(current.visibility / 1000).toFixed(1)} <span className="text-[10px] opacity-40">KM</span></div>
              </div>
            </div>

            <div className="section-divider my-3" />

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Gauge size={10} /> PRESSURE
                </div>
                <div className="value text-[13px]">
                  {current.surface_pressure.toFixed(0)} <span className="text-[10px] opacity-40">hPa</span>
                </div>
                <div className="text-[9px] text-[#5a8a9a] uppercase font-mono">
                  ({pressureToRelative(current.surface_pressure)})
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <CloudRain size={10} /> RAIN PROB
                </div>
                <div className="value text-[13px]">{current.precipitation_probability ?? 0}%</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}