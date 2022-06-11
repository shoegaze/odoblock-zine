import * as THREE from "three"
import { AnimatedScene } from "./AnimatedScene"


type AppAnimatedSceneMethod = (this: App, scene: AnimatedScene) => void
type AppMethod = (this: App) => void

export interface App {
  cam: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  animatedScenes: Array<AnimatedScene>
  clock: THREE.Clock

  addScene: AppAnimatedSceneMethod
  startAnimation: AppMethod
  resize: AppMethod
  render: AppMethod

  translate: (dx: number, dy: number, sensitivity: number) => void,
  zoom: (dz: number, sensitivity: number) => void
}

export const createApp = (canvas: HTMLCanvasElement): App => {
  const { innerWidth: w, innerHeight: h } = window
  const s = Math.min(w, h)

  // Perspective camera:
  const cam = new THREE.PerspectiveCamera(
    45,         // fov
    1.0,        // aspect
    0.001, 1000 // near, far
  )

  cam.position.z = 500.0

  const renderer = new THREE.WebGLRenderer({
    canvas
  })

  renderer.setSize(s, s)

  // TODO: Disable debug mode in production
  renderer.debug = {
    checkShaderErrors: true
  }

  return {
    cam,
    renderer,
    animatedScenes: [],
    clock: new THREE.Clock(false),

    addScene(this: App, as: AnimatedScene) {
      as.setup(this)
      this.animatedScenes.push(as)
    },

    startAnimation(this: App) {
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

    resize(this: App) {
      const { innerWidth: w, innerHeight: h } = window
      const s = Math.min(w, h)

      cam.aspect = 1.0
      cam.updateProjectionMatrix()

      renderer.setSize(s, s)
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
    },


    translate(this: App, dx: number, dy: number, sensitivity: number) {
      cam.translateX(-dx * sensitivity)
      cam.translateY(+dy * sensitivity)
    },

    // dz < 0: zoom in ;
    // dz > 0: zoom out
    zoom(this: App, dz: number, sensitivity: number) {
      const dzPersp = +dz * sensitivity + (dz < 0 ? 1.0 : 0.0)
      cam.translateZ(dzPersp)
    }
  }
}
