import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../animatedScene"

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
  function animate(this: AnimatedScene, _) {
    const cube = this.scene.getObjectByName('cube')

    if (cube) {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
    }
  }
)

export default scene0