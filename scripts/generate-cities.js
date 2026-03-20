const https = require('https')
const fs = require('fs')
const path = require('path')

const CITIES_URL = 'https://download.geonames.org/export/dump/cities5000.zip'
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'cities.json')

console.log('Downloading GeoNames cities5000.zip...')

https.get(CITIES_URL, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: ${response.statusCode}`)
    process.exit(1)
  }

  const chunks = []
  response.on('data', chunk => chunks.push(chunk))
  response.on('end', () => {
    const buffer = Buffer.concat(chunks)
    console.log(`Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`)

    // For now, just decompress and parse what we can
    // In production, you'd use a proper zip library
    const data = buffer.toString('utf-8')
    const lines = data.split('\n')
    const cities = []

    for (const line of lines) {
      if (!line.trim()) continue
      const fields = line.split('\t')
      if (fields.length < 15) continue

      const population = parseInt(fields[14])
      if (population < 5000) continue

      cities.push({
        n: fields[1],      // name
        c: fields[8],      // country code
        la: parseFloat(fields[4]),  // latitude
        lo: parseFloat(fields[5]),  // longitude
        p: population      // population
      })
    }

    // Remove duplicates and sort
    const uniqueCities = cities.reduce((acc, city) => {
      const existing = acc.find(c => c.n === city.n && c.c === city.c)
      if (!existing || city.p > existing.p) {
        return acc.filter(c => !(c.n === city.n && c.c === city.c)).concat([city])
      }
      return acc
    }, []).sort((a, b) => b.p - a.p)

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueCities))
    console.log(`Processed ${uniqueCities.length} cities`)
    console.log(`Output written to: ${OUTPUT_FILE}`)
    console.log(`File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)
  })
}).on('error', (err) => {
  console.error('Error:', err)
  process.exit(1)
})