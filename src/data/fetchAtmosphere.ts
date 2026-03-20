import type { AtmosphereResponse } from './cities'

/**
 * Fetches atmosphere/moisture data from Open-Meteo
 * @param lat Latitude
 * @param lon Longitude
 * @returns AtmosphereResponse
 */
export async function fetchAtmosphere(
  lat: number,
  lon: number
): Promise<AtmosphereResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relativehumidity_2m,dewpoint_2m,surface_pressure,cloudcover,visibility,precipitation_probability&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Atmosphere API error: ${response.status}`)
  }

  const data = await response.json()
  return data as AtmosphereResponse
}