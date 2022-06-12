import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { AnimatedScene } from "./AnimatedScene"
import AppCameraDragger from "./AppCameraDragger"
import { Layer, layersDistance, toId } from "./Layer"
import Physics from "./Physics"
import homeLayer from "./layers/0/HomeLayer"


type AppLayerMethod = (this: App, layer: Layer) => void
type AppLayerIdMethod = (this: App, id: number) => void
type AppMethod = (this: App) => void

export interface App {
  cam: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  globalLayers: Array<Layer>
  layers: Array<Layer>
  activeLayer: Layer
  clock: THREE.Clock
  cameraDragger: AppCameraDragger

  start: AppMethod
  startPhysics: AppMethod
  startAnimation: AppMethod
  resize: AppMethod
  render: AppMethod

  addGlobalLayer: AppLayerMethod
  addLayer: AppLayerMethod
  setActiveLayer: AppLayerIdMethod
  getClosestLayer: (this: App) => Layer

  queueTranslation: (dx: number, dy: number) => void
  queueZoom: (zoom: number) => void
}

export const createApp = (canvas: HTMLCanvasElement): App => {
  const { innerWidth: w, innerHeight: h } = window
  const s = Math.min(w, h)

  const cam = new THREE.PerspectiveCamera(
    45,         // fov
    1.0,        // aspect
    0.1, 500.0  // near, far
  )

  const [zMax, zMin] = [layersDistance, -Infinity]
  cam.position.z = zMax

  const renderer = new THREE.WebGLRenderer({
    canvas
  })

  renderer.setSize(s, s)

  // TODO: Disable debug mode in production
  renderer.debug = {
    checkShaderErrors: true
  }

  // TODO: Hoist to constructor
  const maxIdleTime = 0.1
  let lastInputTime = 0.0

  let queuedTranslation: THREE.Vector2 | null = null
  let queuedZoom: number | null = null

  // TODO: Hoist this to AppCameraDragger
  const maxSpeed = 100.0


  return {
    cam,
    renderer,
    globalLayers: [],
    layers: [homeLayer],
    activeLayer: homeLayer,
    clock: new THREE.Clock(false),
    cameraDragger: new AppCameraDragger(cam),

    start() {
      this.globalLayers.forEach((layer: Layer) => {
        layer.setActive(true)
      })

      // TODO: Refactor this (DRY)
      const home = this.layers[0]
      home.scenes.forEach((as: AnimatedScene) => {
        as.setup(this)
        as.scene.translateZ(home.zPos)
      })

      this.setActiveLayer(0)

      this.startPhysics()
      this.startAnimation()
    },

    addGlobalLayer(layer: Layer) {
      this.globalLayers.push(layer)

      layer.scenes.forEach((as: AnimatedScene) => {
        as.setup(this)
      })

      layer.setActive(true)
    },

    addLayer(layer: Layer) {
      this.layers.push(layer)

      layer.scenes.forEach((as: AnimatedScene) => {
        as.setup(this)

        // TODO: Do this only when the containing layer is active ... O(n_obj)?
        // Convert to all objects to their layer-spaces
        as.scene.translateZ(layer.zPos)
      })

      layer.setActive(false)
    },

    setActiveLayer(id: number) {
      const layer = this.layers[id]

      if (!layer) {
        throw Error(`No layer with id ${id}`)
      }

      this.activeLayer.setActive(false)
      this.activeLayer = layer
      this.activeLayer.setActive(true)
    },

    getClosestLayer(): Layer {
      const z = this.cam.position.z

      if (z >= 0.0) {
        return this.layers[0]
      }

      const zLast = this.layers[this.layers.length - 1].zPos
      if (z <= zLast) {
        return this.layers[this.layers.length - 1]
      }

      const idNow = toId(z)
      const layerNow = this.layers[idNow]

      // Can we assume that idNow :: [1, n-1] ?
      const idPrev = clamp(idNow - 1, 0, this.layers.length - 1)
      const layerPrev = this.layers[idPrev]

      const distNow = Math.abs(cam.position.z - layerNow.zPos)
      const distPrev = Math.abs(cam.position.z - layerPrev.zPos)

      return distNow < distPrev ? layerNow : layerPrev
    },

    startPhysics() {
      this.cameraDragger.startPhysicsLoop(
        (physics: Physics, _) => { // beforeUpdate
          { // Reset camera rotation
            this.cam.rotation.set(0.0, 0.0, 0.0)
          }

          { // Clamp speed of velocity
            physics.velocity.clampLength(0, maxSpeed)
          }

          { // Apply queued inputs as a force
            const force = new THREE.Vector3(
              queuedTranslation?.x ?? 0.0,
              queuedTranslation?.y ?? 0.0,
              queuedZoom ?? 0.0
            )

            physics.addForce(force)

            // Reset force to be applied next step
            queuedTranslation = null
            queuedZoom = null
          }
        },
        (physics: Physics, dt: number) => { // afterUpdate
          { // Decelerate if no input received for t seconds
            const t = this.clock.elapsedTime - lastInputTime
            if (t > maxIdleTime) {
              const s = 0.0

              const a = physics.acceleration.clone()
              const f = a.negate()
                .multiplyScalar(s)
                .multiplyScalar(physics.mass)

              physics.addForce(f)
              physics.velocity.multiplyScalar(s)
            }
          }

          { // Apply camera inertia tilt
            const dp = new THREE.Vector3(
              physics.velocity.x,
              physics.velocity.y,
              0.0
            ).multiplyScalar(dt)

            // const k = new THREE.Vector3(0.0, 0.0, +1.0)

            // dp `cross` k = (-dp_y, +dp_x, 0)^T
            //  when dp_z = 0
            const axis = new THREE.Vector3(-dp.y, +dp.x, 0.0)

            const maxAngle = Math.PI / 4
            const angle = maxAngle * (dp.length() / maxSpeed)

            // TODO: Fix jitter: lerp between previous axis/angle?
            this.cam.rotateOnAxis(axis, angle)
          }

          { // Clamp camera z
            const z = clamp(
              this.cam.position.z,
              zMin,
              zMax
            )

            this.cam.position.z = z

            // TODO: Reset velocity and acceleration when it bumps against zMin/zMax
            // const epsilon = 1.0e-3
            // if (Math.abs(z - zMax) < epsilon || Math.abs(z - zMin) < epsilon) {
            //   if (Math.abs(physics.velocity.z) > epsilon) {
            //     physics.acceleration.set(0.0, 0.0, 0.0)
            //     physics.velocity.set(0.0, 0.0, 0.0)
            //   }
            // }
          }

          { // Update active layer
            const id = toId(this.cam.position.z)
            const i = Math.min(id, this.layers.length - 1)

            this.setActiveLayer(i)
          }
        }
      )
    },

    startAnimation() {
      this.clock.start()

      const animate = () => {
        requestAnimationFrame(animate)

        // TODO: this.activeLayer.scenes.filter(s => s is AnimatedScene)
        this.activeLayer.scenes.forEach((as: AnimatedScene) => {
          as.animate(this)
        })

        this.globalLayers.forEach((layer: Layer) => {
          layer.scenes.forEach((as: AnimatedScene) => {
            as.animate(this)
          })
        })

        this.render()
      }

      animate()
    },

    resize() {
      const { innerWidth: w, innerHeight: h } = window
      const s = Math.min(w, h)

      cam.aspect = s / s
      cam.updateProjectionMatrix()

      renderer.setSize(s, s)
    },

    render() {
      renderer.autoClear = true
      this.activeLayer.scenes.forEach((as: AnimatedScene) => {
        renderer.render(as.scene, cam)

        // TODO: Create AnimatedScene.afterRender() method
        // Overlays next scene on top of this one
        renderer.clearDepth()
        // Prevents next scene from clearing the previous scene's buffer
        renderer.autoClear = false
      })

      renderer.autoClear = false
      this.globalLayers.forEach((layer: Layer) => {
        layer.scenes.forEach((as: AnimatedScene) => {
          renderer.render(as.scene, cam)
          renderer.clearDepth()
        })
      })
    },


    // TODO: if ||<dx, dy>|| < threshold, decelerate
    queueTranslation(this: App, dx: number, dy: number) {
      // TODO: Hoist this to AppCameraDragger
      const sensitivity = 10.0

      // Convert (dx, dy) from screen axes to world axes
      queuedTranslation = new THREE.Vector2(-dx, +dy)
        .multiplyScalar(sensitivity)

      lastInputTime = this.clock.elapsedTime
    },

    // dz < 0: zoom in ;
    // dz > 0: zoom out
    queueZoom(this: App, zoom: number) {
      // TODO: Hoist this to AppCameraDragger
      const sensitivity = 10.0

      // Right-most factor prevents the result from being in the range (-s, +s)
      //  where s is the sensitivity.
      //  When |s| < 1, without the factor we will zoom in no matter what.
      queuedZoom = +zoom * sensitivity + (zoom < 0.0 ? 1.0 : 0.0)

      lastInputTime = this.clock.elapsedTime
    }
  }
}
