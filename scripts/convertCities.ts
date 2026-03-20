#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

interface City {
  n: string
  c: string
  la: number
  lo: number
  p: number
}

function writeBinaryCities() {
  const inputPath = path.join(process.cwd(), 'public', 'cities.json')
  const outputPath = path.join(process.cwd(), 'public', 'cities.bin')

  console.log('Reading cities.json...')
  const cities: City[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

  // Each city takes 12 bytes: lat(4) + lon(4) + pop(4) as float32
  const buffer = new ArrayBuffer(cities.length * 12)
  const floatView = new Float32Array(buffer)

  console.log(`Converting ${cities.length} cities to binary...`)

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i]
    const offset = i * 3

    floatView[offset] = city.la      // latitude
    floatView[offset + 1] = city.lo  // longitude
    floatView[offset + 2] = city.p    // population
  }

  // Write binary file
  fs.writeFileSync(outputPath, Buffer.from(buffer))

  const stats = fs.statSync(outputPath)
  console.log(`✓ Created cities.bin (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
  console.log(`  ${cities.length} cities × 12 bytes each = ${stats.size} bytes total`)
  console.log(`  Compression ratio: ${(fs.statSync(inputPath).size / stats.size).toFixed(2)}x`)
}

writeBinaryCities()
