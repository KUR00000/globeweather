import type { WeatherResponse } from './cities'

/**
 * Fetches current weather data from Open-Meteo
 * @param lat Latitude
 * @param lon Longitude
 * @returns WeatherResponse
 */
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m,winddirection_10m,uv_index&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`)
  }

  const data = await response.json()
  return data as WeatherResponse
}