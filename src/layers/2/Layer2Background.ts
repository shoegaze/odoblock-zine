import * as THREE from "three";
import { AnimatedScene, createAnimatedScene } from "../../AnimatedScene";


const layer2Background = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const geo = new THREE.PlaneGeometry(50.0, 50.0)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xbababa
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.z = 0.0

    this.scene.add(mesh)
  },

  function animate(this: AnimatedScene, _) { }
)

export default layer2Background