import * as THREE from 'three'
import type { City } from '../data'
import { latLonToVec3 } from './utils'

export class CityMarkers {
  private instancedMesh: THREE.InstancedMesh
  private cities: City[]
  private dummyObject = new THREE.Object3D()
  private baseColor = new THREE.Color('#0099bb')
  private hoverColor = new THREE.Color('#00ffff')
  private matrix = new THREE.Matrix4()

  constructor(cities: City[]) {
    this.cities = cities

    const geometry = new THREE.SphereGeometry(0.012, 6, 6)
    const material = new THREE.MeshBasicMaterial({
      color: this.baseColor,
      transparent: true,
      opacity: 0.85
    })

    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      cities.length
    )

    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    this.updatePositions()
    this.setBaseColors()
  }

  /**
   * Update all city positions on the globe
   */
  private updatePositions(): void {
    for (let i = 0; i < this.cities.length; i++) {
      const city = this.cities[i]
      const position = latLonToVec3(city.la, city.lo, 2)

      const scale = this.getCityScale(city.p)

      this.dummyObject.position.copy(position)
      this.dummyObject.scale.set(scale, scale, scale)
      this.dummyObject.updateMatrix()

      this.instancedMesh.setMatrixAt(i, this.dummyObject.matrix)
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true
  }

  /**
   * Calculate city marker scale based on population
   */
  private getCityScale(population: number): number {
    if (population > 5_000_000) return 2.0
    if (population > 1_000_000) return 1.5
    if (population > 100_000) return 1.2
    if (population > 50_000) return 1.0
    return 0.8
  }

  /**
   * Set all cities to base color
   */
  private setBaseColors(): void {
    const colors = new Float32Array(this.cities.length * 3)

    for (let i = 0; i < this.cities.length; i++) {
      colors[i * 3] = this.baseColor.r
      colors[i * 3 + 1] = this.baseColor.g
      colors[i * 3 + 2] = this.baseColor.b
    }

    this.instancedMesh.geometry.setAttribute(
      'color',
      new THREE.InstancedBufferAttribute(colors, 3)
    )
  }

  /**
   * Get city by instance ID
   */
  getCityById(instanceId: number): City | null {
    if (instanceId >= 0 && instanceId < this.cities.length) {
      return this.cities[instanceId]
    }
    return null
  }

  /**
   * Get instance ID for a city
   */
  getInstanceId(city: City): number {
    return this.cities.findIndex(
      c => c.n === city.n && c.c === city.c && c.la === city.la && c.lo === city.lo
    )
  }

  /**
   * Highlight a specific city (hovered)
   */
  highlightCity(instanceId: number | null): void {
    const colors = this.instancedMesh.geometry.attributes.color as THREE.InstancedBufferAttribute

    if (colors) {
      // Reset all to base color
      for (let i = 0; i < this.cities.length; i++) {
        colors.setXYZ(i, this.baseColor.r, this.baseColor.g, this.baseColor.b)
      }

      // Highlight hovered city
      if (instanceId !== null && instanceId >= 0 && instanceId < this.cities.length) {
        colors.setXYZ(
          instanceId,
          this.hoverColor.r,
          this.hoverColor.g,
          this.hoverColor.b
        )
      }

      colors.needsUpdate = true
    }
  }

  /**
   * Get the InstancedMesh for rendering
   */
  getMesh(): THREE.InstancedMesh {
    return this.instancedMesh
  }

  /**
   * Raycast against the city markers
   */
  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]): THREE.Intersection | null {
    const localIntersects: THREE.Intersection[] = []
    this.instancedMesh.raycast(raycaster, localIntersects)

    if (localIntersects.length > 0) {
      intersects.push(...localIntersects)
      return localIntersects[0]
    }

    return null
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.instancedMesh.geometry.dispose()
    ;(this.instancedMesh.material as THREE.Material).dispose()
  }
}