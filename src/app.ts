import * as THREE from "three"
import { AnimatedScene } from "./animatedScene"


type AppAnimatedSceneMethod = (this: App, scene: AnimatedScene) => void
type AppMethod = (this: App) => void

export interface App {
  cam: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer,
  animatedScenes: Array<AnimatedScene>,
  // TODO: Create clock field to track time
  // clock: THREE.Clock,

  addScene: AppAnimatedSceneMethod
  startAnimation: AppMethod,
  resize: AppMethod,
  render: AppMethod
}

export
  const createApp = (): App => {
    const { innerWidth: w, innerHeight: h } = window
    const s = Math.min(w, h)
    const s_2 = s / 2
    const cam = new THREE.OrthographicCamera(
      -s_2, +s_2, // left, right
      +s_2, -s_2, // top, bottom
      0.1, 1000)  // near, far

    cam.position.z = 200

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(s, s)
    document.body.appendChild(renderer.domElement)

    return {
      cam,
      renderer,
      animatedScenes: [],

      addScene(this: App, as: AnimatedScene) {
        as.setup(this)
        this.animatedScenes.push(as)
      },

      startAnimation(this: App) {
        const animate = () => {
          requestAnimationFrame(animate)

          this.animatedScenes.forEach(scene => {
            scene.animate(this)
          })

          this.render()
        }

        animate()
      },

      resize(this: App) {
        const { innerWidth: w, innerHeight: h } = window
        const s = Math.min(w, h)
        const s_2 = s / 2

        this.cam.left = -s_2
        this.cam.right = +s_2
        this.cam.top = +s_2
        this.cam.bottom = -s_2
        this.cam.updateProjectionMatrix()

        this.renderer.setSize(s, s)
      },

      render(this: App) {
        renderer.autoClear = true

        this.animatedScenes.forEach(as => {
          renderer.render(as.scene, cam)

          // TODO: Create AnimatedScene.afterRender() method
          // Overlays next scene on top of this one
          renderer.clearDepth()
          // Prevents next scene from clearing the previous scene's buffer
          renderer.autoClear = false
        })
      }
    }
  }
