import * as THREE from 'three'
import { useGlobeStore } from '../store/useGlobeStore'
import { CityMarkers } from './CityMarkers'
import { latLonToVec3, getCityScreenPosition } from './utils'
import type { City } from '../data'

interface GlobeConfig {
  onCityHover?: (city: City | null, event?: MouseEvent) => void
  onCityClick?: (city: City, screenPos: { x: number; y: number }) => void
}

export class Globe {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private cityMarkers: CityMarkers | null = null
  private cityMarkersMesh: THREE.InstancedMesh | null = null
  private earthMesh: THREE.Mesh | null = null
  private atmosphereMesh: THREE.Mesh | null = null
  private starfield: THREE.Points | null = null
  private selectedCityMarker: THREE.Mesh | null = null
  private selectedCityRing: THREE.Mesh | null = null
  private animationId: number | null = null
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()
  private hoveredCityId: number | null = null

  private width: number
  private height: number
  private config: GlobeConfig

  constructor(
    container: HTMLDivElement,
    width: number,
    height: number,
    config: GlobeConfig = {}
  ) {
    this.width = width
    this.height = height
    this.config = config

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    this.camera.position.set(0, 0, 6)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.domElement.style.display = 'block'
    container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // @ts-ignore - Bypass OrbitControls access modifier restriction
    this.controls.target.set(0, -0.3, 0)
    this.controls.update()
    this.setupScene()
    this.setupEventListeners()

    console.log('[Globe] Constructor complete, canvas appended to DOM')
  }

  private setupScene(): void {
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    this.scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.position.set(5, 3, 5)
    this.scene.add(sunLight)

    // Earth sphere — start with fallback material, upgrade when texture loads
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a5a,
      roughness: 0.8,
      metalness: 0.1
    })
    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
    this.scene.add(this.earthMesh)

    // Load texture asynchronously and swap in when ready
    this.loadTexture('/textures/earth_day.jpg').then(texture => {
      if (texture && this.earthMesh) {
        ;(this.earthMesh.material as THREE.MeshStandardMaterial).map = texture
        ;(this.earthMesh.material as THREE.MeshStandardMaterial).needsUpdate = true
      }
    })

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(2.06, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          gl_FragColor = vec4(0.0, 0.8, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    })
    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    this.scene.add(this.atmosphereMesh)

    // Starfield
    const starGeometry = new THREE.BufferGeometry()
    const starVertices = []
    for (let i = 0; i < 4000; i++) {
      const radius = 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      starVertices.push(x, y, z)
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    const starMaterial = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff, sizeAttenuation: true })
    this.starfield = new THREE.Points(starGeometry, starMaterial)
    this.scene.add(this.starfield)
  }

  private setupEventListeners(): void {
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this))
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / this.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.height) * 2 + 1

    if (!this.cityMarkers) return

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects: THREE.Intersection[] = []
    const intersection = this.cityMarkers.raycast(this.raycaster, intersects)

    if (intersection && intersection.instanceId !== undefined) {
      const city = this.cityMarkers.getCityById(intersection.instanceId)
      if (city && this.hoveredCityId !== intersection.instanceId) {
        this.hoveredCityId = intersection.instanceId
        this.cityMarkers.highlightCity(this.hoveredCityId)

        if (this.config.onCityHover) {
          this.config.onCityHover(city, event)
        }
      }
    } else if (this.hoveredCityId !== null) {
      this.hoveredCityId = null
      this.cityMarkers.highlightCity(null)

      if (this.config.onCityHover) {
        this.config.onCityHover(null, event)
      }
    }
  }

  private onClick(event: MouseEvent): void {
    if (!this.cityMarkers) return

    this.mouse.x = (event.clientX / this.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects: THREE.Intersection[] = []
    const intersection = this.cityMarkers.raycast(this.raycaster, intersects)

    if (intersection && intersection.instanceId !== undefined) {
      const city = this.cityMarkers.getCityById(intersection.instanceId)
      if (city && this.config.onCityClick) {
        const screenPos = { x: event.clientX, y: event.clientY }
        this.config.onCityClick(city, screenPos)
        this.createSelectedCityIndicator(city)
      }
    }
  }

  private onMouseDown(event: MouseEvent): void {
    event.preventDefault()
  }

  private onMouseUp(event: MouseEvent): void {
    event.preventDefault()
  }

  public createSelectedCityIndicator(city: City): void {
    this.removeSelectedCityIndicator()

    const position = latLonToVec3(city.la, city.lo, 2.01)

    // Selected city dot
    const dotGeometry = new THREE.SphereGeometry(0.025, 16, 16)
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    })
    this.selectedCityMarker = new THREE.Mesh(dotGeometry, dotMaterial)
    this.selectedCityMarker.position.copy(position)
    this.scene.add(this.selectedCityMarker)

    // Pulsing ring
    const ringGeometry = new THREE.RingGeometry(0.03, 0.04, 16)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
    this.selectedCityRing = new THREE.Mesh(ringGeometry, ringMaterial)
    this.selectedCityRing.position.copy(position)
    this.selectedCityRing.lookAt(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.selectedCityRing)
  }

  public removeSelectedCityIndicator(): void {
    if (this.selectedCityMarker) {
      this.scene.remove(this.selectedCityMarker)
      ;(this.selectedCityMarker.material as THREE.Material).dispose()
      this.selectedCityMarker.geometry.dispose()
      this.selectedCityMarker = null
    }

    if (this.selectedCityRing) {
      this.scene.remove(this.selectedCityRing)
      ;(this.selectedCityRing.material as THREE.Material).dispose()
      this.selectedCityRing.geometry.dispose()
      this.selectedCityRing = null
    }
  }

  private loadTexture(url: string): Promise<THREE.Texture | null> {
    return new Promise((resolve) => {
      const textureLoader = new THREE.TextureLoader()
      textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        () => resolve(null)
      )
    })
  }

  public async loadCities(cities: City[]): Promise<void> {
    this.cityMarkers = new CityMarkers(cities)
    this.cityMarkersMesh = this.cityMarkers.getMesh()
    this.scene.add(this.cityMarkersMesh)
  }

  public updateCityScreenPosition(city: City | null): void {
    if (!city || !this.camera) return

    const { x, y } = getCityScreenPosition(
      city.la,
      city.lo,
      this.camera,
      this.width,
      this.height
    )

    useGlobeStore.getState().setCityScreenPos({ x, y })
  }

  public render(): void {
    this.controls.update()

    // Update starfield twinkling
    if (this.starfield) {
      const positions = this.starfield.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001
      }
      this.starfield.geometry.attributes.position.needsUpdate = true
    }

    // Update selected city indicator animation
    if (this.selectedCityMarker && this.selectedCityRing) {
      const time = Date.now() * 0.002
      const scale = 1 + Math.sin(time) * 0.1
      this.selectedCityMarker.scale.set(scale, scale, scale)
      this.selectedCityRing.scale.set(scale, scale, scale)
      ;(this.selectedCityRing.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(time) * 0.3
    }

    // Update city screen position every frame
    const city = useGlobeStore.getState().selectedCity
    this.updateCityScreenPosition(city)

    this.renderer.render(this.scene, this.camera)
  }

  public startAnimation(): void {
    if (this.animationId) return

    const animate = () => {
      this.render()
      this.animationId = requestAnimationFrame(animate)
    }
    animate()
  }

  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public handleResize(width: number, height: number): void {
    this.width = width
    this.height = height

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  public dispose(): void {
    this.stopAnimation()
    this.controls.dispose()

    if (this.cityMarkers) {
      this.cityMarkers.dispose()
    }

    if (this.earthMesh) {
      this.scene.remove(this.earthMesh)
      this.earthMesh.geometry.dispose()
      ;(this.earthMesh.material as THREE.Material).dispose()
    }

    if (this.atmosphereMesh) {
      this.scene.remove(this.atmosphereMesh)
      this.atmosphereMesh.geometry.dispose()
      ;(this.atmosphereMesh.material as THREE.Material).dispose()
    }

    if (this.starfield) {
      this.scene.remove(this.starfield)
      this.starfield.geometry.dispose()
      ;(this.starfield.material as THREE.Material).dispose()
    }

    this.renderer.dispose()
  }
}

class OrbitControls {
  private camera: THREE.Camera
  private domElement: HTMLElement
  private isMouseDown = false
  private mouseDownPosition = new THREE.Vector2()
  private target = new THREE.Vector3()

  // Bound handlers for proper removal
  private _onMouseDown: (e: MouseEvent) => void
  private _onMouseMove: (e: MouseEvent) => void
  private _onMouseUp: () => void
  private _onWheel: (e: WheelEvent) => void

  minDistance = 3.5
  maxDistance = 9
  autoRotate = true
  autoRotateSpeed = 0.3
  enableDamping = false

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera
    this.domElement = domElement

    // Bind handlers once
    this._onMouseDown = this.onMouseDown.bind(this)
    this._onMouseMove = this.onMouseMove.bind(this)
    this._onMouseUp = this.onMouseUp.bind(this)
    this._onWheel = this.onWheel.bind(this)

    this.setupEvents()
  }

  private setupEvents(): void {
    this.domElement.addEventListener('mousedown', this._onMouseDown)
    this.domElement.addEventListener('mousemove', this._onMouseMove)
    this.domElement.addEventListener('mouseup', this._onMouseUp)
    this.domElement.addEventListener('wheel', this._onWheel, { passive: false })
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.isMouseDown = true
      this.mouseDownPosition.set(event.clientX, event.clientY)
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return

    const deltaX = event.clientX - this.mouseDownPosition.x
    const deltaY = event.clientY - this.mouseDownPosition.y

    const spherical = new THREE.Spherical()
    spherical.setFromVector3(this.camera.position.clone().sub(this.target))

    spherical.theta -= deltaX * 0.005
    spherical.phi -= deltaY * 0.005

    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))

    this.camera.position.setFromSpherical(spherical).add(this.target)
    this.camera.lookAt(this.target)

    this.mouseDownPosition.set(event.clientX, event.clientY)
  }

  private onMouseUp(): void {
    this.isMouseDown = false
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault()

    const distance = this.camera.position.distanceTo(this.target)
    const newDistance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, distance + event.deltaY * 0.01)
    )

    const direction = this.camera.position.clone().sub(this.target).normalize()
    this.camera.position.copy(this.target).add(direction.multiplyScalar(newDistance))
  }

  update(): void {
    // Slow auto-rotate when user isn't dragging
    if (this.autoRotate && !this.isMouseDown) {
      const spherical = new THREE.Spherical()
      spherical.setFromVector3(this.camera.position.clone().sub(this.target))
      spherical.theta += this.autoRotateSpeed * 0.001
      this.camera.position.setFromSpherical(spherical).add(this.target)
    }

    this.camera.lookAt(this.target)
  }

  dispose(): void {
    this.domElement.removeEventListener('mousedown', this._onMouseDown)
    this.domElement.removeEventListener('mousemove', this._onMouseMove)
    this.domElement.removeEventListener('mouseup', this._onMouseUp)
    this.domElement.removeEventListener('wheel', this._onWheel)
  }
}