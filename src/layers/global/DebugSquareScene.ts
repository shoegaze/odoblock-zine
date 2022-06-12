import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../../AnimatedScene"
import { App } from "../../App"


const debugSquareScene: AnimatedScene = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const geo = new THREE.PlaneGeometry(1.0, 1.0)
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 v_uv;
        void main() {
          v_uv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 v_uv;
        void main() {
          gl_FragColor = vec4(0.0, v_uv.x, v_uv.y, 1.0);
        }
      `
    })

    const plane = new THREE.Mesh(geo, mat)
    plane.name = 'plane'

    this.scene.add(plane)
  },

  function animate(this: AnimatedScene, app: App) {
    const plane = this.scene.getObjectByName('plane')
    const { x, y, z } = app.cam.position

    plane!.position.set(
      x - 3.5,
      y + 3.5,
      z - 10.0
    )
  }
)

export default debugSquareScene