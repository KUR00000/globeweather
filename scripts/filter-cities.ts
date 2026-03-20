#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

interface City {
  n: string
  c: string
  la: number
  lo: number
  p: number
}

async function filterTopCities() {
  const inputFile = path.join(process.cwd(), 'public', 'cities.json')
  const outputFile = path.join(process.cwd(), 'public', 'cities-top25k.json')

  console.log('Reading cities...')
  const cities: City[] = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

  console.log(`Total cities: ${cities.length}`)

  // Filter to top 25,000 cities
  const topCities = cities.slice(0, 25000)

  console.log(`Filtered cities: ${topCities.length}`)

  // Write filtered JSON with proper formatting
  fs.writeFileSync(outputFile, JSON.stringify(topCities, null, 2))

  const stats = fs.statSync(outputFile)
  console.log(`Output file: ${outputFile}`)
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

  // Preview top 10 cities
  console.log('\nTop 10 cities:')
  topCities.slice(0, 10).forEach((city, i) => {
    console.log(`${i+1}. ${city.n} (${city.c}) - Pop: ${city.p.toLocaleString()}`)
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  filterTopCities()
}
