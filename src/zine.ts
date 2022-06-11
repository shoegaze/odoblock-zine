import { AnimatedScene } from './AnimatedScene'
import { createApp } from './App'
import scene0 from './scenes/Scene0'
import scene1 from './scenes/Scene1'
import scene2 from './scenes/Scene2'


{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas)

  const scenes: Array<AnimatedScene> = [
    scene2,
    scene1,
    scene0
  ]

  scenes.forEach(scene => {
    app.addScene(scene)
  })

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

  app.startPhysics()
  app.startAnimation()
}