import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"

import { AppScene } from "./collection/scene/AppScene"
import { AnimatedScene } from "./collection/scene/AnimatedScene"
import { Layer, layersDistance, toId } from "./collection/Layer"
import { Physics } from "./physics/Physics"
import AppCameraDragger from "./AppCameraDragger"
import createAppBackground from "./AppBackground"
import { localLayers } from "./data/layer"
import { AppInputType, createAppInput } from "./AppInput"


type AppLayerMethod = (this: App, layer: Layer) => void
type AppLayerIdMethod = (this: App, id: number) => void
type AppMethod = (this: App) => void

export interface App {
  cam: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  cameraDragger: AppCameraDragger

  persistentLayers: Array<Layer>
  layers: Array<Layer>
  activeLayer: Layer

  start: AppMethod
  startPhysics: AppMethod
  startAnimation: AppMethod
  resize: AppMethod
  render: AppMethod

  addPersistentLayer: AppLayerMethod
  addLayer: AppLayerMethod
  setActiveLayer: AppLayerIdMethod
  getClosestLayer: (this: App) => Layer

  queueTranslation: (dx: number, dy: number) => void
  queueZoom: (zoom: number) => void
}

type CreateAppOptions = {
  fov?: number
  near?: number
  far?: number
  idleTimeBeforeDeceleration?: number
  camMaxSpeed?: number
  translationSensitivity?: number
  zoomSensitivity?: number
}

const createAppOptionsDefault: CreateAppOptions = {
  fov: 45.0,
  near: 0.1,
  far: 500.0,
  idleTimeBeforeDeceleration: 0.1,
  camMaxSpeed: 100.0,
  translationSensitivity: 10.0,
  zoomSensitivity: 10.0
}

export const createApp = (canvas: HTMLCanvasElement, options = createAppOptionsDefault): App => {
  const {
    fov,
    near, far,
    idleTimeBeforeDeceleration,
    camMaxSpeed,
    translationSensitivity,
    zoomSensitivity
  } = { ...createAppOptionsDefault, ...options }

  const { innerWidth: w, innerHeight: h } = window
  // Square frame
  const s = Math.min(w, h)

  // TODO: Calculate far from layersDistance
  const cam = new THREE.PerspectiveCamera(
    fov,      // fov
    s / s,    // aspect
    near, far // near, far
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

  const bg = createAppBackground(new THREE.Vector2(s, s))
  const input = createAppInput(new THREE.Clock(true))
  const HomeLayer = localLayers[0]

  return {
    cam,
    renderer,
    persistentLayers: [],
    layers: [HomeLayer],
    // Initialize with HomeLayer for type safety
    activeLayer: HomeLayer,
    clock: new THREE.Clock(false),
    cameraDragger: new AppCameraDragger(cam),

    start() {
      { // Start loops
        this.clock.start()
        this.startPhysics()
        this.startAnimation()
      }

      { // Initialize layers
        this.persistentLayers.forEach((layer: Layer) => {
          layer.setActive(true)
        })

        // TODO: Refactor this (DRY)
        const home = this.layers[0]
        home.scenes.forEach((appScene: AppScene) => {
          appScene.setup(this)
          appScene.scene.translateZ(home.zPos)
        })

        this.setActiveLayer(0)
      }
    },

    addPersistentLayer(layer: Layer) {
      this.persistentLayers.push(layer)

      layer.scenes.forEach((appScene: AppScene) => {
        appScene.setup(this)
      })

      layer.setActive(true)
    },

    addLayer(layer: Layer) {
      this.layers.push(layer)

      layer.scenes.forEach((as: AppScene) => {
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

    // TODO: Refactor this into its own object(s)
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
            physics.velocity.clampLength(0, camMaxSpeed!)
          }

          { // Apply queued inputs as a force
            const { x: dx, y: dy } = input.getQueuedInput(AppInputType.Translation) as THREE.Vector2
            const dz = input.getQueuedInput(AppInputType.Zoom) as number

            const force = new THREE.Vector3(dx, dy, dz)
            physics.addForce(force)

            input.resetQueuedInputs()
          }
        },
        (physics: Physics, dt: number) => { // afterUpdate
          { // Decelerate if no input received for t seconds
            const t = this.clock.getElapsedTime()
            const lastInputTime = input.getLastInputTime()

            if (t - lastInputTime > idleTimeBeforeDeceleration!) {
              const s = 0.9

              const a = physics.acceleration.clone()
              const f = a.negate()
                .multiplyScalar(s)
                .multiplyScalar(physics.mass)

              if (f.lengthSq() > 1.0e-6) {
                physics.addForce(f)
                physics.velocity.multiplyScalar(s)
              }
              else {
                physics.acceleration.set(0.0, 0.0, 0.0)
                physics.velocity.set(0.0, 0.0, 0.0)
              }
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

            // TODO: Normalize axis
            const axis = new THREE.Vector3(-dp.y, +dp.x, 0.0)

            const maxAngle = Math.PI / 4
            const angle = maxAngle * (dp.length() / camMaxSpeed!)

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

            if (this.activeLayer !== this.layers[i]) {
              this.setActiveLayer(i)
            }
          }
        }
      )
    },

    startAnimation() {
      const animate = () => {
        requestAnimationFrame(animate)

        // TODO: this.activeLayer.scenes.filter(s => s is AnimatedScene)
        this.activeLayer.scenes.forEach((appScene: AppScene | AnimatedScene) => {
          (appScene as AnimatedScene).animate?.(this)
        })

        this.persistentLayers.forEach((layer: Layer) => {
          layer.scenes.forEach((appScene: AppScene | AnimatedScene) => {
            (appScene as AnimatedScene).animate?.(this)
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
      { // Render background
        bg.updateUniforms(this)
        renderer.render(bg.scene, bg.cam)
        renderer.clearDepth()
      }

      this.activeLayer.scenes.forEach((as: AppScene) => {
        renderer.render(as.scene, cam)

        // TODO: Create AnimatedScene.afterRender() method
        // Overlays next scene on top of this one
        renderer.clearDepth()
        // Prevents next scene from clearing the previous scene's buffer
        renderer.autoClear = false
      })

      this.persistentLayers.forEach((layer: Layer) => {
        layer.scenes.forEach((as: AppScene) => {
          renderer.render(as.scene, cam)
          renderer.clearDepth()
        })
      })
    },


    // TODO: if ||<dx, dy>|| < threshold, decelerate
    queueTranslation(this: App, dx: number, dy: number) {
      // Convert (dx, dy) from screen axes to world axes
      const dp = new THREE.Vector2(-dx, +dy)
        .multiplyScalar(translationSensitivity!)

      input.receiveInput(AppInputType.Translation, dp)
    },

    // dz < 0: zoom in ;
    // dz > 0: zoom out
    queueZoom(this: App, zoom: number) {
      // Right-most factor prevents the result from being in the range (-s, +s)
      //  where s is the sensitivity.
      //  When |s| < 1, without the factor we will zoom in no matter what.
      const dz = +zoom * zoomSensitivity! + (zoom < 0.0 ? 1.0 : 0.0)

      input.receiveInput(AppInputType.Zoom, dz)
    }
  }
}
