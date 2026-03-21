import { create } from 'zustand'

import type { WeatherResponse, AirQualityResponse, AtmosphereResponse, SolarResponse, ForecastResponse } from '../data'
import { 
  fetchWeather, 
  fetchAir, 
  fetchAtmosphere, 
  fetchSolar, 
  fetchForecast,
  type City 
} from '../data'

export interface GlobeState {
  // Data
  cities: City[]
  selectedCity: City | null
  cityScreenPos: { x: number; y: number } | null
  theme: 'light' | 'dark'

  // Panel data
  weatherData: WeatherResponse | null
  airData: AirQualityResponse | null
  atmosphereData: AtmosphereResponse | null
  solarData: SolarResponse | null
  forecastData: ForecastResponse | null

  // UI state
  loading: boolean
  panelsVisible: boolean
  error: string | null
  hoveredCityId: number | null

  // Actions
  setCities: (cities: City[]) => void
  setTheme: (theme: 'light' | 'dark') => void
  setCity: (city: City | null, screenPos?: { x: number; y: number }) => void
  selectCity: (city: City, screenPos?: { x: number; y: number }, onComplete?: () => void) => Promise<void>
  setCityScreenPos: (pos: { x: number; y: number }) => void
  setWeatherData: (data: WeatherResponse | null) => void
  setAirData: (data: AirQualityResponse | null) => void
  setAtmosphereData: (data: AtmosphereResponse | null) => void
  setSolarData: (data: SolarResponse | null) => void
  setForecastData: (data: ForecastResponse | null) => void
  setLoading: (loading: boolean) => void
  setPanelsVisible: (visible: boolean) => void
  setError: (error: string | null) => void
  setHoveredCityId: (id: number | null) => void
  clearCity: () => void
  resetData: () => void
}

export const useGlobeStore = create<GlobeState>((set) => ({
  // Initial state
  cities: [],
  selectedCity: null,
  cityScreenPos: null,
  theme: 'dark',

  weatherData: null,
  airData: null,
  atmosphereData: null,
  solarData: null,
  forecastData: null,

  loading: false,
  panelsVisible: false,
  error: null,
  hoveredCityId: null,

  // Actions
  setCities: (cities) => set({ cities }),

  setTheme: (theme) => set({ theme }),

  setCity: (city, screenPos) => set({
    selectedCity: city,
    cityScreenPos: screenPos || null,
    panelsVisible: !!city,
    error: null
  }),

  selectCity: async (city, screenPos, onComplete) => {
    set({ loading: true, error: null })
    try {
      // Calculate theme based on local time
      const utcTime = new Date()
      const localHour = (utcTime.getUTCHours() + city.lo / 15 + 24) % 24
      const isDay = localHour >= 6 && localHour < 18
      set({ theme: isDay ? 'light' : 'dark' })

      const [weather, air, atmosphere, solar, forecast] = await Promise.all([
        fetchWeather(city.la, city.lo),
        fetchAir(city.la, city.lo),
        fetchAtmosphere(city.la, city.lo),
        fetchSolar(city.la, city.lo),
        fetchForecast(city.la, city.lo)
      ])

      set({
        selectedCity: city,
        cityScreenPos: screenPos || null,
        panelsVisible: true,
        weatherData: weather,
        airData: air,
        atmosphereData: atmosphere,
        solarData: solar,
        forecastData: forecast
      })

      if (onComplete) onComplete()
    } catch (err) {
      console.error('Failed to select city:', err)
      set({ error: 'Failed to load data' })
    } finally {
      set({ loading: false })
    }
  },

  setCityScreenPos: (pos) => set({ cityScreenPos: pos }),

  setWeatherData: (data) => set({ weatherData: data }),

  setAirData: (data) => set({ airData: data }),

  setAtmosphereData: (data) => set({ atmosphereData: data }),

  setSolarData: (data) => set({ solarData: data }),

  setForecastData: (data) => set({ forecastData: data }),

  setLoading: (loading) => set({ loading }),

  setPanelsVisible: (visible) => set({ panelsVisible: visible }),

  setError: (error) => set({ error }),

  setHoveredCityId: (id) => set({ hoveredCityId: id }),

  clearCity: () => set({
    selectedCity: null,
    cityScreenPos: null,
    panelsVisible: false
  }),

  resetData: () => set({
    weatherData: null,
    airData: null,
    atmosphereData: null,
    solarData: null,
    forecastData: null,
    loading: false,
    error: null
  })
}))

// Selectors for performance
export const useSelectedCity = () => useGlobeStore(state => state.selectedCity)
export const useCityScreenPos = () => useGlobeStore(state => state.cityScreenPos)
export const usePanelsVisible = () => useGlobeStore(state => state.panelsVisible)
export const useLoadingState = () => useGlobeStore(state => state.loading)
export const useErrorState = () => useGlobeStore(state => state.error)
export const useHoveredCityId = () => useGlobeStore(state => state.hoveredCityId)