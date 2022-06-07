import { AnimatedScene } from './animatedScene'
import { createApp } from './app'
import scene0 from './scenes/scene0'
import scene1 from './scenes/scene1'
import scene2 from './scenes/scene2'


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

    canvas.onmouseup = (_) => {
      dragging = false
    }

    canvas.onmousemove = (ev) => {
      if (!dragging) {
        return
      }

      const { movementX: dx, movementY: dy } = ev
      const sensitivity = 1.0

      app.translate(dx, dy, sensitivity)
    }
  }

  {
    canvas.onwheel = (ev) => {
      const { deltaY: dz } = ev
      const sensitivity = 0.5

      app.zoom(dz, sensitivity)
    }
  }

  app.startAnimation()
}