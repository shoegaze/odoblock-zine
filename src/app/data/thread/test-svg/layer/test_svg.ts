import * as THREE from "three"

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createStaticScene } from "../../../../collection/scene/StaticScene"
import { loadSvg } from "../../../../utils/loadSvg"


const testSvg = createLocalLayer(0, [
  createStaticScene(
    function setup(this) {
      const group = new THREE.Group()

      loadSvg('svg/test-cat.svg', group, { debug: false })

      group.position.set(
        -25.0,
        +25.0,
        +10.0
      )
      group.scale.multiplyScalar(0.05);
      group.scale.y *= -1

      this.scene.add(group)
    }
  )
])

export default testSvg