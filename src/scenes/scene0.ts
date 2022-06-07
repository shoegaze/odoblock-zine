import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../AnimatedScene"
import { App } from "../App"

const scene0 = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const geo = new THREE.BoxGeometry(100, 100, 100)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })

    const cube = new THREE.Mesh(geo, mat)
    cube.name = 'cube'
    cube.position.z = -50

    this.scene.add(cube)
  },
  function animate(this: AnimatedScene, app: App) {
    const cube = this.scene.getObjectByName('cube')
    const dt = app.clock.getDelta()

    if (cube) {
      cube.rotation.x += Math.PI / 2.0 * dt
      cube.rotation.y += Math.PI / 2.0 * dt
    }
  }
)

export default scene0