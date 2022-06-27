import * as THREE from 'three'

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createStaticScene } from "../../../../collection/scene/StaticScene"


const homeLayer = createLocalLayer(0, [
  createStaticScene(
    function setup(this) {
      const geo = new THREE.PlaneGeometry(50.0, 50.0)
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('./img/jpg/mando.jpg'),
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.z = 0.0

      this.scene.add(mesh)
    }
  )
])

export default homeLayer