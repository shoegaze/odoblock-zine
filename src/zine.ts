import * as THREE from 'three'
import { lerp } from 'three/src/math/MathUtils'


type AnimatedSceneMethod = (this: AnimatedScene, app: App) => void

interface AnimatedScene {
  scene: THREE.Scene,

  setup: AnimatedSceneMethod,
  animate: AnimatedSceneMethod,
  //resize: AnimatedSceneMethod
}

type AppAnimatedSceneMethod = (this: App, scene: AnimatedScene) => void
type AppMethod = (this: App) => void

interface App {
  cam: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer,
  animatedScenes: Array<AnimatedScene>,
  // clock: THREE.Clock,

  addScene: AppAnimatedSceneMethod
  startAnimation: AppMethod,
  resize: AppMethod,
  render: AppMethod
}

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

const createAnimatedScene = (setup: AnimatedSceneMethod, animate: AnimatedSceneMethod): AnimatedScene => ({
  scene: new THREE.Scene(),
  setup,
  animate
})

{ // main
  const app = createApp()

  // TODO: Get scenes from modules
  const scenes: Array<AnimatedScene> = [
    // Scene 0
    createAnimatedScene(
      function setup(this: AnimatedScene, _) {
        const geo = new THREE.BoxGeometry(100, 100, 100)
        const mat = new THREE.MeshBasicMaterial({
          color: 0xff00ff
        })

        const cube = new THREE.Mesh(geo, mat)
        cube.name = 'cube'
        cube.position.z = -50

        this.scene.add(cube)
      },
      function animate(this: AnimatedScene, _) {
        const cube = this.scene.getObjectByName('cube')

        if (cube) {
          cube.rotation.x += 0.01
          cube.rotation.y += 0.01
        }
      }
    ),
    // Scene 1
    createAnimatedScene(
      function setup(this: AnimatedScene, _) {
        for (let i = 0; i < 10; i++) {
          const w = i / 10.0

          const geo = new THREE.SphereGeometry(10, 16, 16)
          const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1.0, 0.0, 0.0).lerp(
              new THREE.Color(0.0, 1.0, 0.0),
              w
            )
          })

          const sphere = new THREE.Mesh(geo, mat)
          sphere.name = `sphere_${i}`
          sphere.position.x = lerp(-200, +200, w)

          this.scene.add(sphere)
        }
      },
      function animate(this: AnimatedScene, app: App) {
        const t = Date.now() / 1000.0 // TODO: use app.clock

        for (let i = 0; i < 10; i++) {
          const sphere = this.scene.getObjectByName(`sphere_${i}`)
          const w = i / 10.0

          if (sphere) {
            const amplitude = 200
            const offset = 2.0 * Math.PI * w

            sphere.position.y = amplitude * Math.sin(t + offset)
          }
        }
      }
    )
  ]

  scenes.forEach(scene => {
    app.addScene(scene)
  })

  window.onresize = () => {
    app.resize()
  }

  app.startAnimation()
}