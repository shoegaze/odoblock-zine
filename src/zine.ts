import { createApp } from './app/App'
import { persistentLayers } from './app/data/layer'
import { localThreads } from './app/data/thread'


{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas, {
    fov: 45.0,
    near: 0.1,
    far: 500.0,
    idleTimeBeforeDeceleration: 0.25,
    translationMaxSpeed: 200.0,
    zoomMaxSpeed: 100.0,
    translationSensitivity: 150.0,
    zoomSensitivity: 90.0,
  })

  const threads = app.getThreads()

  { // Add local threads
    localThreads.forEach((thread) => {
      threads.addThread(thread)
    })
  }

  { // Add persistent layers
    persistentLayers.forEach((layer) => {
      threads.addPersistentLayer(layer)
    })
  }

  window.onresize = () => {
    app.resize()
  }

  { // Mouse handling events
    let dragging = false

    canvas.onmouseenter = () => {
      app.play()
    }

    canvas.onmouseleave = () => {
      app.pause()
    }

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