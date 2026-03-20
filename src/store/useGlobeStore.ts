import { create } from 'zustand'

import type { WeatherResponse, AirQualityResponse, AtmosphereResponse, SolarResponse, ForecastResponse } from '../data'
import type { City } from '../data/cities'

export interface GlobeState {
  // Selection
  selectedCity: City | null
  cityScreenPos: { x: number; y: number } | null

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
  setCity: (city: City | null, screenPos?: { x: number; y: number }) => void
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
  selectedCity: null,
  cityScreenPos: null,

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
  setCity: (city, screenPos) => set({
    selectedCity: city,
    cityScreenPos: screenPos || null,
    panelsVisible: !!city,
    error: null
  }),

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