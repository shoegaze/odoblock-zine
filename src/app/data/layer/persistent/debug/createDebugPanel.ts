import * as THREE from "three"
import * as TroikaText from "troika-three-text"

import { createPersistentLayer, zIdToZPos } from "../../../../collection/layer/Layer"
import { createAnimatedScene } from "../../../../collection/scene/AnimatedScene"


const createDebugPanel = () => createPersistentLayer(
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

      const layersInfo = new TroikaText.Text()
      { // Layers info
        layersInfo.text = ''
        layersInfo.font = './font/ComicMono.ttf'
        layersInfo.fontSize = 0.12
        layersInfo.maxWidth = 2.0
        layersInfo.color = 0xffffff
        layersInfo.anchorX = 'left'
        layersInfo.anchorY = 'top'
        layersInfo.textAlign = 'left'
        layersInfo.strokeWidth = 0.005
        layersInfo.outlineColor = 0x000000
        layersInfo.outlineWidth = 0.01
        layersInfo.sync()

        layersInfo.position.set(-0.98, +1.0, 1.0e-3)
        group.add(layersInfo)
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
        camInfo.position.set(-0.98, -0.25, 1.0e-3)
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

      { // Update layers info
        const appLayers = app.getLayers()
        const activeLayer = appLayers.getActiveLayer()
        const localLayers = appLayers.getLocalLayers()
        const persistentLayers = appLayers.getPersistentLayers()

        const layersInfo = group.children[1] as TroikaText.Text

        layersInfo.text =
          `Layers: n=${localLayers.length}\n` +
          ` * Active Layer: ${activeLayer.zId}\n`

        layersInfo.text += ` * Persistent Layers:\n`
        layersInfo.text += `  > [${persistentLayers.map((({ zId }) => zId)).join(', ')}]\n`

        layersInfo.text += ` * Local Layers:\n`
        localLayers.forEach(({ zId }) => {
          const zPos = zIdToZPos(zId).toFixed(2)
          layersInfo.text += `  > ${zId} (${zPos})\n`
        })

        layersInfo.sync()
      }

      { // Update cam info
        const cam = app.getCamera()
        const camInfo = group.children[2] as TroikaText.Text
        camInfo.text =
          `Camera:\n` +
          ` * speed=${app.getCameraController().getPhysics().velocity.length().toFixed(2)}\n` +
          ` * pos=(${cam.position.x.toFixed(2)},${cam.position.y.toFixed(2)},${cam.position.z.toFixed(2)})\n` +
          ` * rot=(${cam.rotation.x.toFixed(2)},${cam.rotation.y.toFixed(2)},${cam.rotation.z.toFixed(2)})\n`

        camInfo.sync()
      }
    }
  )
)

export default createDebugPanel
