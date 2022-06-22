import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"

import { AppScene } from "./collection/scene/AppScene"
import { AnimatedScene } from "./collection/scene/AnimatedScene"
import { Layer, layersDistance, zPosToZid } from "./collection/layer/Layer"
import createAppGraphics from "./systems/AppGraphics"
import createAppBackground from "./systems/AppBackground"
import { AppInputType, createAppInput } from "./systems/AppInput"
import { AppThreads, createAppThreads } from "./systems/AppThreads"
import { AppLayers, createAppLayers } from "./systems/AppLayers"
import { CameraController, createCameraController } from "./systems/AppCameraController"
import { Physics } from "./physics/Physics"


type AppMethod = (this: App) => void

export interface App {
  getSeconds: () => number
  getCamera: () => THREE.Camera
  getRendererSize: () => THREE.Vector2
  getThreads: () => AppThreads
  getLayers: () => AppLayers
  getCameraController: () => CameraController

  start: AppMethod
  startPhysics: AppMethod
  startAnimation: AppMethod
  resize: AppMethod
  render: AppMethod

  queueTranslation: (dx: number, dy: number) => void
  queueZoom: (zoom: number) => void
}

type CreateAppOptions = {
  fov: number
  near: number
  far: number
  idleTimeBeforeDeceleration: number
  camMaxSpeed: number
  translationSensitivity: number
  zoomSensitivity: number
}

export const createApp = (canvas: HTMLCanvasElement, options: CreateAppOptions): App => {
  const {
    fov,
    near,
    far,
    idleTimeBeforeDeceleration,
    camMaxSpeed,
    translationSensitivity,
    zoomSensitivity
  } = options

  const { innerWidth: w, innerHeight: h } = window
  let s = Math.min(w, h)

  const [zMax, zMin] = [layersDistance, -Infinity]
  const { cam, renderer } = createAppGraphics(canvas, new THREE.Vector2(s, s), {
    fov,
    near,
    far,
    zMax: layersDistance,
    zMin: -Infinity
  })

  const clock = new THREE.Clock(false)

  const app: App = {
    getSeconds: () => {
      return clock.getElapsedTime()
    },

    getCamera: () => {
      return cam
    },

    getRendererSize: () => {
      const size = new THREE.Vector2()
      renderer.getSize(size)

      s = Math.min(size.x, size.y)

      return size
    },

    getThreads: () => {
      return threads
    },

    getLayers: () => {
      return layers
    },

    getCameraController: () => {
      return cameraController
    },

    start() {
      { // Start loops
        clock.start()
        this.startPhysics()
        this.startAnimation()
      }

      { // Initialize layers
        layers.getPersistentLayers().forEach((layer: Layer) => {
          layer.setActive(true)
        })

        // TODO: Refactor this (DRY)
        const home = layers.getLocalLayers()[0]
        home.scenes.forEach((appScene: AppScene) => {
          appScene.setup(this)
          appScene.scene.translateZ(home.zPos)
        })

        layers.setActiveLayer(0)
      }
    },

    startPhysics() {
      cameraController.startPhysicsLoop(
        (physics: Physics, _: number) => {
          { // Reset camera rotation
            cam.rotation.set(0.0, 0.0, 0.0)
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
        (physics: Physics, dt: number) => {
          { // Decelerate if no input received for t seconds
            const t = clock.getElapsedTime()
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
            cam.rotateOnAxis(axis, angle)
          }

          { // Clamp camera z
            const z = clamp(
              cam.position.z,
              zMin,
              zMax
            )

            cam.position.z = z

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
            const id = zPosToZid(cam.position.z)
            const i = Math.min(id, layers.getLocalLayers().length - 1)

            const localLayers = layers.getLocalLayers()

            if (layers.getActiveLayer() !== localLayers[i]) {
              layers.setActiveLayer(i)
            }
          }
        }
      )
    },

    startAnimation() {
      const animate = () => {
        requestAnimationFrame(animate)

        const activeLayer = layers.getActiveLayer()
        // TODO: this.activeLayer.scenes.filter(s => s is AnimatedScene)
        activeLayer.scenes.forEach((appScene: AppScene | AnimatedScene) => {
          (appScene as AnimatedScene).animate?.(this)
        })

        const persistentLayers = layers.getPersistentLayers()
        persistentLayers.forEach((layer: Layer) => {
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

      const activeLayer = layers.getActiveLayer()
      activeLayer.scenes.forEach((as: AppScene) => {
        renderer.render(as.scene, cam)

        // TODO: Create AnimatedScene.afterRender() method
        // Overlays next scene on top of this one
        renderer.clearDepth()
        // Prevents next scene from clearing the previous scene's buffer
        renderer.autoClear = false
      })

      const persistentLayers = layers.getPersistentLayers()
      persistentLayers.forEach((layer: Layer) => {
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

  const bg = createAppBackground(new THREE.Vector2(s, s), new THREE.Clock(true))
  const input = createAppInput(new THREE.Clock(true))
  const threads = createAppThreads()
  const layers = createAppLayers(app, cam)
  const cameraController = createCameraController(cam)

  return app
}