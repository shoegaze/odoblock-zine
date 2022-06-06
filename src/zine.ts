import { AnimatedScene } from './animatedScene'
import { createApp } from './app'
import scene0 from './scenes/scene0'
import scene1 from './scenes/scene1'
import scene2 from './scenes/scene2'


{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas)

  const scenes: Array<AnimatedScene> = [
    // scene0,
    // scene1,
    scene2
  ]

  scenes.forEach(scene => {
    app.addScene(scene)
  })

  window.onresize = () => {
    app.resize()
  }

  // TODO: Implement these events
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

      const { clientX: x, clientY: y } = ev
      console.log('[App]', 'mouse: ', 'x:', x, 'y:', y)

      const { movementX: dx, movementY: dy } = ev
      console.log('[App]', 'drag: ', 'dx:', dx, 'dy:', dy)

      // TODO:
      // dx_real = -dx / canvas.clientWidth
      // dy_real = -dy / canvas.clientHeight
      // app.translate(dx, dy)
    }
  }

  {
    canvas.onwheel = (ev) => {
      const { deltaY: dz } = ev
      console.log('[App]', 'wheel: ', 'dz:', dz)

      // TODO:
      // dz < 0: zoom in ; dz > 0: zoom out
      // app.zoom(dz)
    }
  }

  app.startAnimation()
}