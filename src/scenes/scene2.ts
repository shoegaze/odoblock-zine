import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../animatedScene"
import { App } from "../app"


interface Scene2 extends AnimatedScene {
  size: THREE.Vector2,
  lastUpdate: number,
  updateInterval: number
}

const scene2: Scene2 = {
  size: new THREE.Vector2(0, 0),
  lastUpdate: 0,
  updateInterval: 5.0,

  ...createAnimatedScene(
    function setup(this: AnimatedScene, app: App) {
      const self = this as Scene2

      app.renderer.getSize(self.size)
      const { x: w, y: h } = self.size

      const geo = new THREE.PlaneGeometry(w, h)
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(
          './img/test.png'
        )
      })

      const mesh = new THREE.Mesh(geo, mat)
      this.scene.add(mesh)

      self.lastUpdate = app.clock.getElapsedTime()
    },

    function animate(this: AnimatedScene, _: App) { }
  )
}

export default scene2