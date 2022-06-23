import * as THREE from "three"
import { Text } from "troika-three-text"

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createStaticScene } from "../../../../collection/scene/StaticScene"


const textLine1 = createLocalLayer(
  1,
  createStaticScene(
    function setup(this) {
      const geo = new THREE.PlaneGeometry(7.5, 7.5)
      const mat = new THREE.Material()
      const text = new Text(geo, mat)

      text.text = "Thread 0.1:\nSuspendisse dictum ultricies magna, id ultricies ex dictum nec."
      text.anchorX = 'center'
      text.font = './font/ComicMono.ttf'
      text.textAlign = 'center'
      text.fontSize = 0.5
      text.maxWidth = 7.5
      text.color = 0xecd24a
      text.outlineColor = 0x000000
      text.outlineWidth = 0.02

      text.translateY(-1.0)
      text.rotateX(-Math.PI / 2 + Math.PI / 7)

      this.scene.add(text)
    }
  )
)

export default textLine1