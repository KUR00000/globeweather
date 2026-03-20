export interface CitiesWorkerMessage {
  type: 'chunk'
  cities: City[]
  current: number
  total: number
  isComplete: boolean
}

export interface City {
  n: string
  c: string
  la: number
  lo: number
  p: number
}

// Listen for messages from main thread
self.onmessage = async (event: MessageEvent<string>) => {
  const jsonUrl = event.data

  try {
    const response = await fetch(jsonUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const text = await response.text()
    const cities: City[] = JSON.parse(text)

    // Send cities in chunks of 5000
    const CHUNK_SIZE = 5000
    for (let i = 0; i < cities.length; i += CHUNK_SIZE) {
      const chunk = cities.slice(i, Math.min(i + CHUNK_SIZE, cities.length))
      const message: CitiesWorkerMessage = {
        type: 'chunk',
        cities: chunk,
        current: i + chunk.length,
        total: cities.length,
        isComplete: i + CHUNK_SIZE >= cities.length
      }

      // @ts-ignore - postMessage exists in Web Worker context
      self.postMessage(message)

      // Yield to event loop to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  } catch (error) {
    // @ts-ignore - postMessage exists in Web Worker context
    self.postMessage({ type: 'error', error: error.message })
  }
}
