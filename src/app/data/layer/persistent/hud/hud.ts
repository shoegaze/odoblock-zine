import * as THREE from "three"

import { createPersistentLayer } from "../../../../collection/layer/Layer"
import { createAnimatedScene } from "../../../../collection/scene/AnimatedScene"


const hud = createPersistentLayer([
  createAnimatedScene(
    function setup(this) {
      const geo = new THREE.PlaneGeometry(1.0, 1.0)
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('./img/HUD.png'),
        transparent: true,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.z = 0.0

      this.scene.add(mesh)
    },

    function animate(this, app) {
      const mesh = this.scene.children[0]
      const { x: cx, y: cy, z: cz } = app.getCamera().position

      mesh.position.set(cx, cy, cz - 1.1)
    }
  )
])

export default hud