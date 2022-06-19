import * as THREE from "three"

import { createAnimatedScene } from "../../../../collection/scene/AnimatedScene"


export default createAnimatedScene(
  function setup(this, _) {
    const geo = new THREE.BoxGeometry(8.0, 8.0, 8.0)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })

    const cube = new THREE.Mesh(geo, mat)
    cube.name = 'cube'
    cube.position.z = +30.0

    this.scene.add(cube)
  },

  function animate(this, _/*, dt: number*/) {
    const cube = this.scene.getObjectByName('cube')

    cube!.rotation.x += Math.PI / 2.0 * 1.0/60.0
    cube!.rotation.y += Math.PI / 3.0 * 1.0/60.0
  }
)