import { createApp } from './app/App'
import { localLayers, persistentLayers } from './app/data/layer'


{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas)

  { // Add persistent layers
    persistentLayers.forEach((layer) => {
      app.addPersistentLayer(layer)
    })
  }

  { // Add local layers
    // Filter out HomeLayer
    localLayers.slice(1).forEach((layer) => {
      app.addLayer(layer)
    })
  }

  window.onresize = () => {
    app.resize()
  }

  { // Drag event
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
}