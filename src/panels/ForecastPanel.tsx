import { useGlobeStore } from '../store/useGlobeStore'
import { wmoCodeToDescription, getDayName } from '../globe/utils'
import { Calendar, Droplets } from 'lucide-react'
import { DynamicIcon } from '../hud/DynamicIcon'

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
    <div className="panel-hud visible min-w-[600px] max-w-[90vw] w-auto">
      <div className="panel-header flex justify-center items-center">
        <Calendar size={14} className="mr-2" /> 7-DAY FORECAST
      </div>
      <div className="panel-content px-5 py-4">
        {loading && (
          <div className="grid grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="loading-shimmer h-20 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && daily && (
          <div className="grid grid-cols-7 gap-3">
            {daily.time.map((date, index) => {
              const weather = wmoCodeToDescription(daily.weathercode[index])
              const minTemp = daily.temperature_2m_min[index]
              const maxTemp = daily.temperature_2m_max[index]
              const rainProb = daily.precipitation_probability_max[index]

              return (
                <div
                  key={date}
                  className="flex flex-col items-center bg-black/40 border border-white/5 rounded-2xl p-3 transition-all duration-300 hover:bg-hud-cyan/10 hover:border-hud-cyan/30 hover:-translate-y-1 relative overflow-hidden cursor-default group"
                >
                  {/* Rain Probability Background Height */}
                  {rainProb > 0 && (
                    <div
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-hud-cyan/15 to-transparent z-0 pointer-events-none transition-all duration-500"
                      style={{ height: `${rainProb}%` }}
                    />
                  )}

                  <div className="z-10 flex flex-col items-center w-full">
                    {/* Day name */}
                    <div
                      className="label text-[9px] font-bold tracking-widest mb-2"
                      style={{ color: index === 0 ? '#00e5ff' : '#6c8a9c' }}
                    >
                      {formatDay(date, index)}
                    </div>

                    {/* Weather icon */}
                    <div className="text-hud-cyan mb-2 drop-shadow-lg group-hover:scale-110 transition-transform">
                      {weather?.icon && (
                        <DynamicIcon name={weather.icon} size={24} strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Temperatures */}
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-lg font-bold text-white">
                        {Math.round(maxTemp)}°
                      </span>
                      <span className="text-xs font-medium text-[#6c8a9c]">
                        {Math.round(minTemp)}°
                      </span>
                    </div>

                    {/* Rain probability text */}
                    <div
                      className="flex items-center gap-1 label text-[9px]"
                      style={{ color: rainProb > 20 ? '#00e5ff' : '#4a6b7c' }}
                    >
                      <Droplets size={8} />
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