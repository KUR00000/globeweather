import type { SolarResponse } from './cities'

/**
 * Fetches solar/daylight data from Open-Meteo
 * @param lat Latitude
 * @param lon Longitude
 * @returns SolarResponse
 */
export async function fetchSolar(
  lat: number,
  lon: number
): Promise<SolarResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max&timezone=auto&forecast_days=1`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Solar API error: ${response.status}`)
  }

  const data = await response.json()
  return data as SolarResponse
}