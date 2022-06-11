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
    animatedScenes: [],
    clock: new THREE.Clock(false),
    cameraDragger: new AppCameraDragger(cam),

    addScene(as: AnimatedScene) {
      as.setup(this)
      this.animatedScenes.push(as)
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
        (physics: Physics, _) => { // afterUpdate
          { // Decelerate if no input received for t seconds
            const t = this.clock.elapsedTime - lastInputTime
            if (t > maxIdleTime) {
              const s = 0.9

              const a = physics.acceleration.clone()
              const f = a.negate()
                .multiplyScalar(s)
                .multiplyScalar(physics.mass)

              physics.addForce(f)
              physics.velocity.multiplyScalar(s)
            }
          }

          { // Apply camera inertia tilt
            const v = new THREE.Vector3(
              physics.velocity.x,
              physics.velocity.y,
              0.0
            )
            // const k = new THREE.Vector3(0.0, 0.0, +1.0)

            // v `cross` k = (-v_y, +v_x, 0)^T
            //  when v_z = 0
            const axis = new THREE.Vector3(-v.y, +v.x, 0.0)

            const maxAngle = Math.PI / 3500
            const angle = maxAngle * (v.length() / maxSpeed)

            // TODO: Fix jitter: lerp between previous axis/angle?
            this.cam.rotateOnAxis(axis, angle)
          }
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

      lastInputTime = this.clock.elapsedTime
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

      lastInputTime = this.clock.elapsedTime
    }
  }
}
