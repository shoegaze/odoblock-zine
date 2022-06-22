import * as THREE from "three"
import { Text } from "troika-three-text"

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createStaticScene } from "../../../../collection/scene/StaticScene"


const textLine0 = createLocalLayer(
  createStaticScene(
    function setup(this) {
      const geo = new THREE.PlaneGeometry(1.0, 1.0)
      const mat = new THREE.Material()
      const text = new Text(geo, mat)

      text.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

      this.scene.add(text)
    }
  )
)

export default textLine0