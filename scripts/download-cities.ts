#!/usr/bin/env tsx
/**
 * Downloads and processes GeoNames cities5000.txt into a compact JSON format
 * Run with: tsx scripts/download-cities.ts
 */

import { createWriteStream } from 'fs'
import { createReadStream } from 'fs'
import { createGunzip } from 'zlib'
import { pipeline } from 'stream/promises'
import path from 'path'
import unzipper from 'unzipper'

const CITIES_URL = 'https://download.geonames.org/export/dump/cities5000.zip'
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'cities.json')

interface GeoNamesRecord {
 geonameid: string
 name: string
 asciiname: string
 alternatenames: string
 latitude: string
 longitude: string
 feature_class: string
 feature_code: string
 country_code: string
 cc2: string
 admin1: string
 admin2: string
 admin3: string
 admin4: string
 population: string
 elevation: string
 dem: string
 timezone: string
 modification_date: string
}

interface CompactCity {
 n: string // name
 c: string // country code
 la: number // latitude
 lo: number // longitude
 p: number // population
}

async function downloadAndProcessCities() {
 console.log('Downloading GeoNames cities5000.txt...')

 try {
 const response = await fetch(CITIES_URL)
 if (!response.ok) {
 throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
 }

 const buffer = await response.arrayBuffer()
 console.log(`Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`)

 // Extract from ZIP and parse
 const zipBuffer = Buffer.from(buffer)
 const zip = await unzipper.Open.buffer(zipBuffer)

 // Find and extract cities5000.txt
 const file = zip.files.find(f => f.path === 'cities5000.txt')
 if (!file) {
 throw new Error('cities5000.txt not found in zip file')
 }

 const text = await file.buffer()
 const lines = text.toString('utf-8').split('\n')
 const cities: CompactCity[] = []

 for (const line of lines) {
 if (!line.trim()) continue

 const fields = line.split('\t')
 if (fields.length < 15) continue

 const record: GeoNamesRecord = {
 geonameid: fields[0],
 name: fields[1],
 asciiname: fields[2],
 alternatenames: fields[3],
 latitude: fields[4],
 longitude: fields[5],
 feature_class: fields[6],
 feature_code: fields[7],
 country_code: fields[8],
 cc2: fields[9],
 admin1: fields[10],
 admin2: fields[11],
 admin3: fields[12],
 admin4: fields[13],
 population: fields[14],
 elevation: fields[15] || '',
 dem: fields[16] || '',
 timezone: fields[17] || '',
 modification_date: fields[18] || ''
 }

 // Only include cities with population > 5000 (GeoNames already filters this)
 const population = parseInt(record.population)
 if (isNaN(population) || population < 5000) continue

 // Skip duplicates - keep only one entry per city
 const existingIndex = cities.findIndex(c => c.n === record.name && c.c === record.country_code)
 if (existingIndex !== -1) {
 if (population > cities[existingIndex].p) {
 cities[existingIndex] = {
 n: record.name,
 c: record.country_code,
 la: parseFloat(record.latitude),
 lo: parseFloat(record.longitude),
 p: population
 }
 }
 } else {
 cities.push({
 n: record.name,
 c: record.country_code,
 la: parseFloat(record.latitude),
 lo: parseFloat(record.longitude),
 p: population
 })
 }
 }

 // Remove duplicates and sort by population descending
 const uniqueCities = cities.reduce((acc: CompactCity[], city) => {
 const existing = acc.find(c => c.n === city.n && c.c === city.c)
 if (!existing || city.p > existing.p) {
 return acc.filter(c => !(c.n === city.n && c.c === city.c)).concat([city])
 }
 return acc
 }, []).sort((a, b) => b.p - a.p)

 // Write compact JSON
 const fs = await import('fs')
 fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueCities))

 console.log(`Processed ${uniqueCities.length} cities`)
 console.log(`Output written to: ${OUTPUT_FILE}`)
 console.log(`File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)

 } catch (error) {
 console.error('Error:', error)
 process.exit(1)
 }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
 downloadAndProcessCities()
}

export { downloadAndProcessCities, CITIES_URL, OUTPUT_FILE }
