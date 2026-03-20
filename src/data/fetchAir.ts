import type { AirQualityResponse } from './cities'

/**
 * Fetches air quality data from Open-Meteo
 * @param lat Latitude
 * @param lon Longitude
 * @returns AirQualityResponse
 */
export async function fetchAir(
  lat: number,
  lon: number
): Promise<AirQualityResponse> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Air quality API error: ${response.status}`)
  }

  const data = await response.json()
  return data as AirQualityResponse
}