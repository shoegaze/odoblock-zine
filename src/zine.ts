import { createApp } from './App'
import { Layer } from './Layer'
import layer1 from './layers/1/Layer1'
import debugSquareLayer from './layers/global/DebugSquareLayer'
import { addMembraneLink } from './insaneInTheMembrane'

{
  // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas)

  {
    // Add global layers
    const globalLayers = [debugSquareLayer]

    globalLayers.forEach((layer: Layer) => {
      app.addGlobalLayer(layer)
    })
  }

  {
    // Add layers
    const layers = [layer1]

    layers.forEach((layer: Layer) => {
      app.addLayer(layer)
    })
  }

  window.onresize = () => {
    app.resize()
  }

  {
    // Drag event
    let dragging = false

    canvas.onmousedown = (_) => {
      dragging = true
    }

    document.onmouseup = (_) => {
      dragging = false
    }

    canvas.onmousemove = (ev) => {
      if (!dragging) {
        return
      }

      const { movementX: dx, movementY: dy } = ev
      app.queueTranslation(dx, dy)
    }
  }

  {
    canvas.onwheel = (ev) => {
      const { deltaY: dz } = ev
      app.queueZoom(dz)
    }
  }

  app.start()
  addMembraneLink()
}
