import { useGlobeStore } from '../store/useGlobeStore'
import { wmoCodeToDescription, uvIndexToRisk } from '../globe/utils'
import { Cloud, Thermometer, Wind, Droplets, Sun } from 'lucide-react'
import { DynamicIcon } from '../hud/DynamicIcon'

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
      <div className="panel-header">
        <Cloud size={14} className="mr-2" /> WEATHER DATA
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
            <div className="flex flex-col items-center mb-4">
              <div className="text-hud-cyan mb-2">
                {weatherDesc?.icon && (
                  <DynamicIcon name={weatherDesc.icon} size={32} strokeWidth={1.5} />
                )}
              </div>
              <div className="hero-value leading-none">
                {Math.round(current.temperature_2m)}°C
              </div>
              <div className="label mt-2 tracking-[0.2em] text-[#00e5ff]">
                {weatherDesc?.description?.toUpperCase() || 'UNKNOWN'}
              </div>
            </div>

            <div className="section-divider" />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Thermometer size={10} /> FEELS LIKE
                </div>
                <div className="value">{Math.round(current.apparent_temperature)}°C</div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Droplets size={10} /> PRECIP
                </div>
                <div className="value">{current.precipitation.toFixed(1)} mm</div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Wind size={10} /> WIND
                </div>
                <div className="value">
                  {current.windspeed_10m.toFixed(0)} <span className="text-[10px] opacity-60">KM/H</span> {getWindDirection(current.winddirection_10m)}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 label mb-1">
                  <Sun size={10} /> UV INDEX
                </div>
                <div className="value">
                  {current.uv_index.toFixed(1)}{' '}
                  <span className="text-[10px] opacity-50">({uvRisk})</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}