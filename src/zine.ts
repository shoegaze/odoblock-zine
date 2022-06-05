import { AnimatedScene } from './animatedScene'
import { createApp } from './app'
import scene0 from './scenes/scene0'
import scene1 from './scenes/scene1'


{ // main
  const canvas = document.querySelector('#screen') as HTMLCanvasElement
  const app = createApp(canvas)

  const scenes: Array<AnimatedScene> = [scene0, scene1]
  scenes.forEach(scene => {
    app.addScene(scene)
  })

  window.onresize = () => {
    app.resize()
  }

  app.startAnimation()
}