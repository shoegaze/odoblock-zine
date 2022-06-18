import * as THREE from "three"
import * as TroikaText from "troika-three-text"

import { AnimatedScene, createAnimatedScene } from "../../../../collection/AnimatedScene"
import { App } from "../../../../App"


export default createAnimatedScene(
  function setup(this: AnimatedScene, app: App) {
    const group = new THREE.Group()

    { // BG
      const geo = new THREE.PlaneGeometry(2.0, 2.0)
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

    { // Cam info
      const camInfo = new TroikaText.Text()

      camInfo.text = ''
      camInfo.font = './font/ComicMono.ttf'
      camInfo.fontSize = 0.12
      camInfo.maxWidth = 2.0
      camInfo.color = 0xffffff
      camInfo.anchorX = 'left'
      camInfo.anchorY = 'top'
      camInfo.textAlign = 'left'
      camInfo.strokeWidth = 0.005
      camInfo.outlineColor = 0x000000
      camInfo.outlineWidth = 0.01
      camInfo.sync()

      camInfo.position.set(-0.98, +1.0, 1.0e-3)
      group.add(camInfo)
    }

    this.scene.add(group)
  },

  function animate(this: AnimatedScene, app: App) {
    const group = this.scene.children[0]
    const { x, y, z } = app.cam.position

    // TODO: Create method to set position to screen space
    group?.position.set(
      x - 3.0,
      y + 3.0,
      z - 10.0
    )

    {
      const cam = app.cam
      const camInfo = group.children[1] as TroikaText.Text
      camInfo.text =
        `cam:\n` +
        ` * pos = (${cam.position.x.toFixed(2)}, ${cam.position.y.toFixed(2)}, ${cam.position.z.toFixed(2)})`

      camInfo.sync()
    }
  }
)