import * as THREE from "three"
import { lerp } from "three/src/math/MathUtils"

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createAnimatedScene } from "../../../../collection/scene/AnimatedScene"
import { createStaticScene } from "../../../../collection/scene/StaticScene"

// TODO: Split layers up
const testLayer = createLocalLayer(1, [
  // Scene 2
  createStaticScene(
    function setup(this) {
      const geo = new THREE.PlaneGeometry(50.0, 50.0)
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('./img/png/test.png')
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.z = 0.0

      this.scene.add(mesh)
    }
  ),
  // Scene 1
  createAnimatedScene(
    function setup(this) {
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

    function animate(this, app) {
      const t = app.getSeconds()

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
  ),
  // Scene 0
  createAnimatedScene(
    function setup(this) {
      const geo = new THREE.BoxGeometry(8.0, 8.0, 8.0)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff00ff
      })

      const cube = new THREE.Mesh(geo, mat)
      cube.name = 'cube'
      cube.position.z = +30.0

      this.scene.add(cube)
    },

    function animate(this/*, dt: number*/) {
      const cube = this.scene.getObjectByName('cube')
      const dt = 1.0 / 60.0

      cube!.rotation.x += Math.PI / 2.0 * dt
      cube!.rotation.y += Math.PI / 3.0 * dt
    }
  )
])

export default testLayer