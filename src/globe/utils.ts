import * as THREE from 'three'

/**
 * Converts latitude and longitude to 3D vector on sphere
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param radius Sphere radius
 * @returns THREE.Vector3 position
 */
export function latLonToVec3(lat: number, lon: number, radius: number = 2): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

/**
 * Converts 3D world coordinates to screen coordinates
 * @param vec3 3D vector to project
 * @param camera Three.js camera
 * @param width Viewport width
 * @param height Viewport height
 * @returns Object with x, y screen coordinates
 */
export function vec3ToScreen(
  vec3: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const vector = vec3.clone()
  vector.project(camera)

  const x = (vector.x * 0.5 + 0.5) * width
  const y = (-(vector.y * 0.5) + 0.5) * height

  return { x, y }
}

/**
 * Calculates the screen position for a city dot given lat/lon
 * @param lat Latitude
 * @param lon Longitude
 * @param camera Three.js camera
 * @param width Viewport width
 * @param height Viewport height
 * @returns Screen coordinates {x, y}
 */
export function getCityScreenPosition(
  lat: number,
  lon: number,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const worldPos = latLonToVec3(lat, lon, 2)
  return vec3ToScreen(worldPos, camera, width, height)
}

/**
 * Converts WMO weather codes to human-readable descriptions
 * @param code WMO weather code
 * @returns Object with description and icon
 */
export function wmoCodeToDescription(code: number): {
  description: string
  icon: string
} {
  const codeMap: Record<number, { description: string; icon: string }> = {
    0: { description: 'Clear sky', icon: '☀️' },
    1: { description: 'Mainly clear', icon: '🌤️' },
    2: { description: 'Partly cloudy', icon: '⛅' },
    3: { description: 'Overcast', icon: '☁️' },
    45: { description: 'Fog', icon: '🌫️' },
    48: { description: 'Icing fog', icon: '🌫️' },
    51: { description: 'Light drizzle', icon: '🌧️' },
    53: { description: 'Drizzle', icon: '🌧️' },
    55: { description: 'Heavy drizzle', icon: '🌧️' },
    61: { description: 'Slight rain', icon: '🌧️' },
    63: { description: 'Rain', icon: '🌧️' },
    65: { description: 'Heavy rain', icon: '🌧️' },
    71: { description: 'Slight snow', icon: '❄️' },
    73: { description: 'Snow', icon: '❄️' },
    75: { description: 'Heavy snow', icon: '❄️' },
    80: { description: 'Rain showers', icon: '🌦️' },
    81: { description: 'Showers', icon: '🌦️' },
    82: { description: 'Heavy showers', icon: '🌦️' },
    95: { description: 'Thunderstorm', icon: '⛈️' },
    96: { description: 'Thunderstorm with hail', icon: '⛈️' },
    99: { description: 'Heavy thunderstorm with hail', icon: '⛈️' }
  }

  return codeMap[code] || { description: 'Unknown', icon: '❓' }
}

/**
 * Converts AQI value to color and category
 * @param aqi Air Quality Index
 * @returns Color code and category
 */
export function aqiToCategory(aqi: number): {
  color: string
  category: string
} {
  if (aqi <= 50) {
    return { color: '#00e400', category: 'Good' }
  } else if (aqi <= 100) {
    return { color: '#ffff00', category: 'Moderate' }
  } else if (aqi <= 150) {
    return { color: '#ff7e00', category: 'Unhealthy for Sensitive' }
  } else if (aqi <= 200) {
    return { color: '#ff0000', category: 'Unhealthy' }
  } else if (aqi <= 300) {
    return { color: '#8f3f97', category: 'Very Unhealthy' }
  }
  return { color: '#7e0023', category: 'Hazardous' }
}

/**
 * Calculates UV index risk level
 * @param uv UV index value
 * @returns Risk level
 */
export function uvIndexToRisk(uv: number): string {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very High'
  return 'Extreme'
}

/**
 * Converts pressure to relative term (High/Low)
 * @param pressure in hPa
 * @returns High or Low (relative to 1013.25 hPa)
 */
export function pressureToRelative(pressure: number): string {
  return pressure > 1013.25 ? 'High' : 'Low'
}

/**
 * Converts seconds to hours and minutes string
 * @param seconds Duration in seconds
 * @returns Formatted string like "13h 42m"
 */
export function secondsToHoursMinutes(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

/**
 * Normalizes temperature range for consistent scaling
 */
export function normalizeTemperature(temp: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (temp - min) / (max - min)))
}

/**
 * Gets day name from date string or index
 */
export function getDayName(dateStr?: string, index?: number): string {
  if (dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  }
  if (index !== undefined) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    return days[index]
  }
  return ''
}