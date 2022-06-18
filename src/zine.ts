import debugSquareLayer from './app/data/layer/persistent/debug/DebugSquareLayer'
import transitionLayer from './app/data/layer/persistent/transition/TransitionLayer'
import layer1 from './app/data/layer/1/Layer1'
import { Layer } from './app/collection/Layer'
import { createApp } from './app/App'
import homeLayer from './app/data/layer/0/HomeLayer'

{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas)

  { // Add persistent layers
    const persistentLayers = [
      debugSquareLayer,
      transitionLayer
    ]

    persistentLayers.forEach((layer: Layer) => {
      app.addPersistentLayer(layer)
    })
  }

  { // Add layers
    const layers = [
      layer1,
    ]

    layers.forEach((layer: Layer) => {
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