import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { Howler } from "howler"

import { layersDistance, zPosToZid } from "./collection/layer/Layer"
import createAppGraphics from "./systems/AppGraphics"
import createAppBackground from "./systems/AppBackground"
import { AppInputType, createAppInput } from "./systems/AppInput"
import { AppThreads, createAppThreads } from "./systems/AppThreads"
import { CameraController, createCameraController } from "./systems/AppCameraController"
import { AudioScene } from "./collection/scene/AudioScene"


type AppMethod = (this: App) => void

export interface App {
  getSeconds: () => number
  getCamera: () => THREE.Camera
  getRendererSize: () => THREE.Vector2
  getThreads: () => AppThreads
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
  translationMaxSpeed: number
  zoomMaxSpeed: number
  translationSensitivity: number
  zoomSensitivity: number
}

export const createApp = (canvas: HTMLCanvasElement, options: CreateAppOptions): App => {
  const {
    fov,
    near,
    far,
    idleTimeBeforeDeceleration,
    translationMaxSpeed,
    zoomMaxSpeed,
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
    zMax,
    zMin
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

    getCameraController: () => {
      return cameraController
    },

    start() {
      { // Start loops
        clock.start()
        this.startPhysics()
        this.startAnimation()
      }
    },

    startPhysics() {
      cameraController.startPhysicsLoop(
        (physics, _) => {
          { // Reset camera rotation
            cam.rotation.set(0.0, 0.0, 0.0)
          }

          { // Clamp to max speeds
            const vTranslation = new THREE.Vector3(
              physics.velocity.x,
              physics.velocity.y,
              0.0
            ).clampLength(0, translationMaxSpeed)

            const vZoom = clamp(physics.velocity.z, -zoomMaxSpeed, +zoomMaxSpeed)

            physics.velocity.set(
              vTranslation.x,
              vTranslation.y,
              vZoom
            )
          }

          { // Apply queued inputs as a force
            const { x: dx, y: dy } = input.getQueuedInput(AppInputType.Translation) as THREE.Vector2
            const dz = input.getQueuedInput(AppInputType.Zoom) as number

            const force = new THREE.Vector3(dx, dy, dz)
            physics.addForce(force)

            input.resetQueuedInputs()
          }
        },
        (physics, dt) => {
          { // Decelerate if no input received for t seconds
            const t = clock.getElapsedTime()
            const lastInputTime = input.getLastInputTime()

            if (t - lastInputTime > idleTimeBeforeDeceleration) {
              const s = 0.9
              const f = physics.acceleration.clone()
                .lerp(
                  new THREE.Vector3(0.0),
                  s * dt
                )
                .negate()
                .multiplyScalar(physics.mass)

              if (f.lengthSq() > 1.0e-6) {
                physics.addForce(f)
                // TODO: Make this time dependent
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
            const axis = new THREE.Vector3(-dp.y, +dp.x, 0.0).normalize()

            const maxAngle = Math.PI / 4.0
            const rotationSensitivity = 4.0
            const angle = maxAngle * Math.min(1.0, rotationSensitivity * dp.length() / translationMaxSpeed)

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
            const [_, end] = threads.getBounds()
            const i = Math.min(
              zPosToZid(cam.position.z),
              end
            )
            const pointer = threads.getPointer()

            if (i > pointer) {
              threads.incrementPointer()
            }
            else if (i < pointer) {
              threads.decrementPointer()
            }
          }

          { // Update audio contexts
            // if (cam.moved) {

            threads.getActiveLayers().forEach(layer => {
              layer.scenes.forEach(scene => {
                const audioScene = scene as AudioScene

                audioScene.updateStereo?.(cam)
                audioScene.updateVolume?.(cam)
              })
            })

            // }

            // const { x: px, y: py, z: pz } = cam.position
            // const dir = new THREE.Vector3(0, 0, -1.0)
            // dir.applyQuaternion(cam.quaternion)

            // const { x: dx, y: dy, z: dz } = dir

            // // Howler.pos(px, py, pz)
            // Howler.orientation(
            //   px, py, pz,
            //   dx, dy, dz
            // )
          }
        }
      )
    },

    startAnimation() {
      const animate = () => {
        requestAnimationFrame(animate)

        threads.animate()
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

      threads.render(renderer)
    },

    // TODO: if ||<dx, dy>|| < threshold, decelerate
    queueTranslation(this: App, dx: number, dy: number) {
      // Convert (dx, dy) from screen axes to world axes
      const dp = new THREE.Vector2(-dx, +dy)
        .multiplyScalar(translationSensitivity)

      input.receiveInput(AppInputType.Translation, dp)
    },

    // dz < 0: zoom in ;
    // dz > 0: zoom out
    queueZoom(this: App, zoom: number) {
      // Right-most factor prevents the result from being in the range (-s, +s)
      //  where s is the sensitivity.
      //  When |s| < 1, without the factor we will zoom in no matter what.
      const dz = +zoom * zoomSensitivity + (zoom < 0.0 ? 1.0 : 0.0)

      input.receiveInput(AppInputType.Zoom, dz)
    }
  }

  const bg = createAppBackground(new THREE.Vector2(s, s), new THREE.Clock(true))
  const input = createAppInput(new THREE.Clock(true))
  const threads = createAppThreads(app)
  const cameraController = createCameraController(cam)

  return app
}