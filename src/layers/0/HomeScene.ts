import * as THREE from "three";
import { AnimatedScene, createAnimatedScene } from "../../AnimatedScene";


const homeScene = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const geo = new THREE.PlaneGeometry(50.0, 50.0)
    const mat = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('./img/mando.jpg')
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.z = 0.0

    this.scene.add(mesh)
  },

  function animate(this: AnimatedScene, _) { }
)

export default homeScene