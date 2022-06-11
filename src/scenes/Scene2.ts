import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../AnimatedScene"
import { App } from "../App"


let size: THREE.Vector2 = new THREE.Vector2(0.0)

const scene2: AnimatedScene = {
  ...createAnimatedScene(
    function setup(this: AnimatedScene, _) {
      const geo = new THREE.PlaneGeometry(50.0, 50.0)
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('./img/test.png')
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.z = -80.0

      this.scene.add(mesh)
    },

    function animate(this: AnimatedScene, _: App) { }
  )
}

export default scene2
