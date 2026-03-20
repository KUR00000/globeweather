import type { ForecastResponse } from './cities'

/**
 * Fetches 7-day forecast data from Open-Meteo
 * @param lat Latitude
 * @param lon Longitude
 * @returns ForecastResponse
 */
export async function fetchForecast(
  lat: number,
  lon: number
): Promise<ForecastResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,precipitation_probability_max&timezone=auto&forecast_days=7`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`)
  }

  const data = await response.json()
  return data as ForecastResponse
}