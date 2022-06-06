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
  window.ondragstart = () => false
  window.ondrag = () => false
  window.ondragend = () => false

  app.startAnimation()
}