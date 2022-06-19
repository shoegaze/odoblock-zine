import * as THREE from "three"
import { lerp } from "three/src/math/MathUtils"

import { AnimatedScene, createAnimatedScene } from "../../../../collection/scene/AnimatedScene"
import { App } from "../../../../App"


export default createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    for (let i = 0; i < 10; i++) {
      const w = i / 10.0

      const geo = new THREE.SphereGeometry(0.5, 16, 16)
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.0, 0.0, 0.0).lerp(
          new THREE.Color(0.0, 1.0, 0.0),
          w
        )
      })

      const sphere = new THREE.Mesh(geo, mat)
      sphere.name = `sphere_${i}`
      sphere.position.x = lerp(-15.0, +15.0, w)
      sphere.position.z = +20.0

      this.scene.add(sphere)
    }
  },

  function animate(this: AnimatedScene, app: App) {
    const t = app.clock.elapsedTime

    for (let i = 0; i < 10; i++) {
      const sphere = this.scene.getObjectByName(`sphere_${i}`)
      const w = i / 10.0

      if (sphere) {
        const amplitude = 16.0
        const offset = 2.0 * Math.PI * w

        sphere.position.y = amplitude * Math.sin(t + offset)
      }
    }
  }
)