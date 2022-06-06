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
  updateInterval: 2.5,

  ...createAnimatedScene(
    function setup(this: AnimatedScene, app: App) {
      const self = this as Scene2

      app.renderer.getSize(self.size)
      const { x: w, y: h } = self.size

      const geo = new THREE.PlaneGeometry(w, h)
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(
          `https://picsum.photos/${w}/${h}`
        )
      })

      const mesh = new THREE.Mesh(geo, mat)
      this.scene.add(mesh)

      self.lastUpdate = app.clock.getElapsedTime()
    },

    function animate(this: AnimatedScene, app: App) {
      const self = this as Scene2

      // Size test
      const sz = new THREE.Vector2()
      app.renderer.getSize(sz)

      if (self.size.equals(sz)) {
        return
      }

      // Time test
      const t = app.clock.getElapsedTime()

      if (t < self.lastUpdate + self.updateInterval) {
        return
      }

      console.log('[Scene2]', 'updating image: ', t)

      self.lastUpdate = t

      // Reset image
      const img = this.scene.children[0] as THREE.Mesh
      this.scene.remove(img)

      this.setup(app)
    }
  )
}

export default scene2