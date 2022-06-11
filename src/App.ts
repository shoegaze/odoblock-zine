import * as THREE from "three"
import { AnimatedScene } from "./AnimatedScene"
import AppCameraDragger from "./AppCameraDragger"
import Physics from "./Physics"


type AppAnimatedSceneMethod = (this: App, scene: AnimatedScene) => void
type AppMethod = (this: App) => void

export interface App {
  cam: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  animatedScenes: Array<AnimatedScene>
  clock: THREE.Clock
  cameraDragger: AppCameraDragger

  addScene: AppAnimatedSceneMethod
  startPhysics: AppMethod
  startAnimation: AppMethod
  resize: AppMethod
  render: AppMethod

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

  cam.position.z = 0.0

  const renderer = new THREE.WebGLRenderer({
    canvas
  })

  renderer.setSize(s, s)

  // TODO: Disable debug mode in production
  renderer.debug = {
    checkShaderErrors: true
  }

  let queuedTranslation: THREE.Vector2 | null = null
  let queuedZoom: number | null = null

  return {
    cam,
    renderer,
    animatedScenes: [],
    clock: new THREE.Clock(false),
    cameraDragger: new AppCameraDragger(cam),

    addScene(as: AnimatedScene) {
      as.setup(this)
      this.animatedScenes.push(as)
    },

    startPhysics() {
      this.cameraDragger.startPhysicsLoop(
        (physics: Physics, _) => {
          { // Clamp speed of velocity
            // TODO: Hoist this to AppCameraDragger
            const maxSpeed = 50.0
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
        (physics: Physics, _) => {
          // TODO: Implement deceleration after receiving no input for t seconds

          { // DEBUG: Naive deceleration towards 0
            const s = 0.9

            const a = physics.acceleration.clone()
            const f = a.negate()
              .multiplyScalar(s)
            // .multiplyScalar(clamp(dt, 0.0, 1.0))
            // .multiplyScalar(physics.mass)

            physics.addForce(f)
            physics.velocity.multiplyScalar(s)
          }

          // { // DEBUG: Log physical parameters
          //   console.groupCollapsed(`Physics Log (t=${this.clock.elapsedTime.toFixed(2)})`)
          //   console.log('dt', dt)
          //   console.log('speed', physics.velocity.length())
          //   console.log('velocity', physics.velocity)
          //   console.log('position', physics.position)
          //   console.groupEnd()
          // }
        }
      )
    },

    startAnimation() {
      this.clock.start()

      const animate = () => {
        requestAnimationFrame(animate)

        this.animatedScenes.forEach(scene => {
          scene.animate(this)
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

      this.animatedScenes.forEach(as => {
        renderer.render(as.scene, cam)

        // TODO: Create AnimatedScene.afterRender() method
        // Overlays next scene on top of this one
        renderer.clearDepth()
        // Prevents next scene from clearing the previous scene's buffer
        renderer.autoClear = false
      })
    },


    // TODO: if ||<dx, dy>|| < threshold, decelerate
    queueTranslation(this: App, dx: number, dy: number) {
      // TODO: Hoist this to AppCameraDragger
      const sensitivity = 10.0

      // Convert (dx, dy) from screen axes to world axes
      queuedTranslation = new THREE.Vector2(-dx, +dy)
        .multiplyScalar(sensitivity)
    },

    // dz < 0: zoom in ;
    // dz > 0: zoom out
    queueZoom(this: App, zoom: number) {
      // TODO: Hoist this to AppCameraDragger
      const sensitivity = 5.0

      // Right-most factor prevents the result from being in the range (-s, +s)
      //  where s is the sensitivity.
      //  When |s| < 1, without the factor we will zoom in no matter what.
      queuedZoom = +zoom * sensitivity + (zoom < 0.0 ? 1.0 : 0.0)
    }
  }
}
