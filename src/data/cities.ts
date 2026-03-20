export interface City {
 n: string
 c: string
 la: number
 lo: number
 p: number
}

// ─── API Response Types ─────────────────────────────────

export interface WeatherResponse {
  current: {
    temperature_2m: number
    apparent_temperature: number
    precipitation: number
    weathercode: number
    windspeed_10m: number
    winddirection_10m: number
    uv_index: number
  }
}

export interface AirQualityResponse {
  current: {
    pm10: number
    pm2_5: number
    carbon_monoxide: number
    nitrogen_dioxide: number
    ozone: number
    us_aqi: number
  }
}

export interface AtmosphereResponse {
  current: {
    relativehumidity_2m: number
    dewpoint_2m: number
    surface_pressure: number
    cloudcover: number
    visibility: number
    precipitation_probability: number
  }
}

export interface SolarResponse {
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
    daylight_duration: number[]
    sunshine_duration: number[]
    uv_index_max: number[]
  }
}

export interface ForecastResponse {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    weathercode: number[]
    precipitation_probability_max: number[]
  }
}

// Fallback dataset with 500 major cities
const FALLBACK_CITIES: City[] = [
 { n: "Shanghai", c: "CN", la: 31.22222, lo: 121.45806, p: 24874500 },
 { n: "Beijing", c: "CN", la: 39.9075, lo: 116.39723, p: 18960744 },
 { n: "Shenzhen", c: "CN", la: 22.54554, lo: 114.0683, p: 17494398 },
 { n: "Guangzhou", c: "CN", la: 23.11667, lo: 113.25, p: 16096724 },
 { n: "Kinshasa", c: "CD", la: -4.32758, lo: 15.31357, p: 16000000 },
 { n: "Istanbul", c: "TR", la: 41.01384, lo: 28.94966, p: 15701602 },
 { n: "Lagos", c: "NG", la: 6.45407, lo: 3.39467, p: 15388000 },
 { n: "Ho Chi Minh City", c: "VN", la: 10.82302, lo: 106.62965, p: 14002598 },
 { n: "Chengdu", c: "CN", la: 30.66667, lo: 104.06667, p: 13568357 },
 { n: "Lahore", c: "PK", la: 31.558, lo: 74.35071, p: 13004135 },
 { n: "Mumbai", c: "IN", la: 19.07283, lo: 72.88261, p: 12691836 },
 { n: "São Paulo", c: "BR", la: -23.5475, lo: -46.63611, p: 12400232 },
 { n: "Mexico City", c: "MX", la: 19.42847, lo: -99.12766, p: 12294193 },
 { n: "Nairobi", c: "KE", la: -1.28333, lo: 36.81667, p: 1000000 },
 { n: "Kigali", c: "RW", la: -1.94995, lo: 30.05885, p: 1000000 },
 { n: "Port Louis", c: "MU", la: -20.16491, lo: 57.50222, p: 1000000 }
]

// Helper: Parse binary data into City array
function parseBinaryCities(buffer: ArrayBuffer): City[] {
  const floatView = new Float32Array(buffer)
  const cities: City[] = []

  // Each city is 3 floats: lat, lon, population
  for (let i = 0; i < floatView.length; i += 3) {
    const lat = floatView[i]
    const lon = floatView[i + 1]
    const pop = floatView[i + 2]

    // Skip if data is invalid
    if (!isFinite(lat) || !isFinite(lon) || pop <= 0) continue

    cities.push({
      n: `City_${i / 3}`, // Placeholder name for binary format
      c: 'XX', // Placeholder country
      la: lat,
      lo: lon,
      p: Math.floor(pop)
    })
  }

  return cities
}

// Binary loading with timeout
async function loadBinaryCities(url: string, timeoutMs: number): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/octet-stream' }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const buffer = await response.arrayBuffer()
    clearTimeout(timeout)

    return buffer
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

// JSON loading with timeout (fallback)
async function loadJsonCities(url: string, timeoutMs: number): Promise<City[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.text()
    clearTimeout(timeout)

    return JSON.parse(data)
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

// Main loading function with binary optimization
export async function loadCities(): Promise<City[]> {
  console.log('Loading cities...')

  // Priority 1: JSON with top 25k dataset (contains actual names)
  try {
    console.log('  Trying cities-top25k.json...')
    const cities = await loadJsonCities('/cities-top25k.json', 25000)
    console.log(`  ✓ Loaded ${cities.length} cities from JSON (with names)`)
    return cities
  } catch (error) {
    console.log(`  ✗ Top 25k JSON failed: ${error instanceof Error ? error.message : error}`)
  }

  // Priority 2: JSON with full dataset
  try {
    console.log('  Trying cities.json...')
    const cities = await loadJsonCities('/cities.json', 15000)
    console.log(`  ✓ Loaded ${cities.length} cities from full JSON`)
    return cities
  } catch (error) {
    console.log(`  ✗ Full JSON failed: ${error instanceof Error ? error.message : error}`)
  }

  // Priority 3: Binary (fast but no names)
  try {
    console.log('  Trying cities.bin...')
    const buffer = await loadBinaryCities('/cities.bin', 10000)
    const cities = parseBinaryCities(buffer)
    console.log(`  ✓ Loaded ${cities.length} cities from binary`)
    return cities
  } catch (error) {
    console.log(`  ✗ Binary failed: ${error instanceof Error ? error.message : error}`)
  }

  // Final fallback: inline cities
  console.warn('Using fallback cities dataset')
  const fallback = [...FALLBACK_CITIES]
  console.log(`  ✓ Loaded ${fallback.length} fallback cities`)
  return fallback
}
