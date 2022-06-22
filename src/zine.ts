import { createApp } from './app/App'
import { localLayers, persistentLayers } from './app/data/layer'
import { localThreads } from './app/data/thread'


{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas, {
    fov: 45.0,
    near: 0.1,
    far: 500.0,
    idleTimeBeforeDeceleration: 0.75,
    camMaxSpeed: 100.0,
    translationSensitivity: 90.0,
    zoomSensitivity: 40.0,
  })

  // TODO: Rename to `app.getLayerManager()`?
  const layers = app.getLayers()
  // const threads = app.getThreads()

  // { // Add local threads
  //   localThreads.forEach((thread) => {
  //     threads.addThread(thread)
  //   })
  // }

  { // Add persistent layers
    persistentLayers.forEach((layerCreator) => {
      layers.addPersistentLayer(layerCreator())
    })
  }

  { // Add local layers
    // Filter out HomeLayer
    localLayers.slice(1).forEach((layerCreator) => {
      layers.addLocalLayer(layerCreator())
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

  { // Zoom event
    canvas.onwheel = (ev) => {
      const { deltaY: dz } = ev
      app.queueZoom(dz)
    }
  }

  app.start()
}