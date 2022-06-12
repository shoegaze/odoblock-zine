import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../../../AnimatedScene"
import { App } from "../../../App"

const scene0 = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const geo = new THREE.BoxGeometry(8.0, 8.0, 8.0)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })

    const cube = new THREE.Mesh(geo, mat)
    cube.name = 'cube'
    cube.position.z = +30.0

    this.scene.add(cube)
  },

  function animate(this: AnimatedScene, app: App) {
    const cube = this.scene.getObjectByName('cube')
    const dt = app.clock.getDelta()

    cube!.rotation.x += Math.PI / 2.0 * dt
    cube!.rotation.y += Math.PI / 3.0 * dt
  }
)

export default scene0
