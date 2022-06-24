import * as THREE from "three"
import * as TroikaText from "troika-three-text"

import { createPersistentLayer, zPosToZid } from "../../../../collection/layer/Layer"
import { createAnimatedScene } from "../../../../collection/scene/AnimatedScene"


const debugPanel = createPersistentLayer([
  createAnimatedScene(
    function setup(this) {
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

      const threadsInfo = new TroikaText.Text()
      { // Layers info
        threadsInfo.text = ''
        threadsInfo.font = './font/ComicMono.ttf'
        threadsInfo.fontSize = 0.12
        threadsInfo.maxWidth = 2.0
        threadsInfo.color = 0xffffff
        threadsInfo.anchorX = 'left'
        threadsInfo.anchorY = 'top'
        threadsInfo.textAlign = 'left'
        threadsInfo.strokeWidth = 0.005
        threadsInfo.outlineColor = 0x000000
        threadsInfo.outlineWidth = 0.01
        threadsInfo.sync()

        threadsInfo.position.set(-0.98, +0.95, 1.0e-3)
        group.add(threadsInfo)
      }

      const camInfo = new TroikaText.Text()
      { // Cam info
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

        // const { bottom: camBottom } = layersInfo.get
        camInfo.position.set(-0.98, -0.15, 1.0e-3)
        group.add(camInfo)
      }

      this.scene.add(group)
    },

    function animate(this, app) {
      const group = this.scene.children[0]
      const { x, y, z } = app.getCamera().position

      // TODO: Create method to set position to screen space
      group.position.set(
        x - 3.0,
        y + 3.0,
        z - 10.0
      )

      { // Update threads info
        const appThreads = app.getThreads()
        const activeThreads = appThreads.getActiveThreads()
        const allThreads = appThreads.getAllThreads()

        const threadsInfo = group.children[1] as TroikaText.Text

        threadsInfo.text = `Threads (${activeThreads.length}/${allThreads.length})\n`

        threadsInfo.text += ` > All Threads: [${appThreads.getBounds().join(', ')}]\n`
        allThreads.forEach((thread) => {
          threadsInfo.text += `  [${(activeThreads.find((t) => t === thread)) ? '*' : ' '}] ${thread.name}: [${thread.zIdBounds.join(', ')}]\n`
        })
      }

      { // Update cam info
        const cam = app.getCamera()
        const camInfo = group.children[2] as TroikaText.Text
        camInfo.text =
          `Camera:\n` +
          ` * current zId=${zPosToZid(cam.position.z)}\n` +
          ` * closest zId=${app.getThreads().getClosestZid(cam.position.z)}\n` +
          ` * speed=${app.getCameraController().getPhysics().velocity.length().toFixed(2)}\n` +
          ` * pos=(${cam.position.x.toFixed(2)},${cam.position.y.toFixed(2)},${cam.position.z.toFixed(2)})\n` +
          ` * rot=(${cam.rotation.x.toFixed(2)},${cam.rotation.y.toFixed(2)},${cam.rotation.z.toFixed(2)})\n`

        camInfo.sync()
      }
    }
  )
])

export default debugPanel
