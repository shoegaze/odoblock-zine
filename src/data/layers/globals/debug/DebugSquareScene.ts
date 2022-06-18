import * as THREE from "three"
import * as TroikaText from "troika-three-text"

import { AnimatedScene, createAnimatedScene } from "../../../../collections/AnimatedScene"
import { App } from "../../../../app/App"


export default createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const group = new THREE.Group()

    { // BG
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
      group.add(plane)
    }

    { // Text
      const text = new TroikaText.Text()

      text.text = 'Hello, world!'
      text.fontSize = 0.2
      text.position.set(0.0, 0.0, 1.0e-3)
      text.color = 0xffffff
      text.maxWidth = 1.0
      text.anchorX = 'center'
      text.anchorY = 'middle'
      text.textAlign = 'center'
      text.strokeWidth = 0.005
      text.outlineColor = 0x000000
      text.outlineWidth = 0.01
      text.sync()

      group.add(text)
    }

    this.scene.add(group)
  },

  function animate(this: AnimatedScene, app: App) {
    const group = this.scene.children[0]
    const { x, y, z } = app.cam.position

    // TODO: Create method to set position to screen space
    group?.position.set(
      x - 3.5,
      y + 3.5,
      z - 10.0
    )
  }
)