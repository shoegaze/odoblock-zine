import * as THREE from "three"

import { App } from "../App"
import { Layer } from "../collection/layer/Layer"
import { AnimatedScene } from "../collection/scene/AnimatedScene"
import { Thread } from "../collection/thread/Thread"


export interface AppThreads {
  addThread: (thread: Thread) => void
  // addPersistentLayer: (layer: Layer) => void
  getActiveThreads: () => Thread[]
  getActiveLayers: () => Layer[]
  getBounds: () => [number, number]

  getPointer: () => number
  incrementPointer: () => void
  decrementPointer: () => void

  animate: () => void
  render: (renderer: THREE.WebGLRenderer) => void
}

export const createAppThreads = (app: App): AppThreads => {
  // TODO:
  // const persistentThread: Thread = {}

  // TODO: Optimize by sorting by zId
  const allThreads: Thread[] = []

  let activeThreads: Thread[] = []
  let activeLayers: Layer[] = []
  // let bounds: [number, number] = [0, 0]
  let pointer = 0

  const updateActiveThreads = (): void => {
    // TODO: Include the one after the current pointer, too
    activeThreads = allThreads.filter(({ idBounds: [start, end] }) => start <= pointer && pointer <= end)
    // TODO: Optimize arrays concatenation with `.concat()`
    //  > Maybe activeLayers.length is small enough?
    // TODO: Activate current+next pointer layers?
    activeLayers = activeThreads.reduce((acc, { layers }) => ([
      ...acc,
      ...layers.filter((layer) => layer.zId === pointer)
    ]), [] as Layer[])
  }

  const activateLayers = (active: boolean): void => {
    activeLayers.forEach(layer => {
      layer.setActive(active)
    })
  }

  return {
    addThread: (thread) => {
      // Ignore duplicates
      //  Is this necessary?
      if (allThreads.find((t) => t === thread)) {
        return
      }

      allThreads.push(thread)

      // Setup
      thread.layers.forEach((layer) => {
        layer.scenes.forEach((appScene) => {
          appScene.setup(app)
          appScene.scene.translateZ(layer.zPos)
        })
      })

      updateActiveThreads()
      activateLayers(true)

      // Set activity
      //  TODO: Layers.activate(i: number): void
      // const [start, end] = thread.idBounds
      // if (start <= pointer && pointer <= end) {
      //   activeThreads.push(thread)

      //   const layers = thread.layers.filter(({ zId }) => zId === pointer)
      //   activeLayers.concat(layers)

      //   layers.forEach(layer => {
      //     layer.setActive(true)
      //   })
      // }
    },

    getActiveThreads() {
      return activeThreads
    },

    getActiveLayers() {
      return activeLayers
    },

    getBounds() {
      // if (dirty) {
      // TODO: Collapse into one pass
      const start = allThreads.reduce((acc, { idBounds: [start, _] }) => Math.min(acc, start), +Infinity)
      const end = allThreads.reduce((acc, { idBounds: [_, end] }) => Math.max(acc, end), -Infinity)
      // }
      // else {
      //   return bounds
      // }

      return [start, end]
    },

    getPointer() {
      return pointer
    },

    incrementPointer() {
      // Deactivate previous layers
      activateLayers(false)

      // TODO:
      //  const maxId = allThreads.reduce((acc, { idBounds: [_, end] }) => Math.max(acc, end), -Infinity)
      //  pointer = min(maxId, pointer + 1)
      pointer++

      // Activate new layers
      updateActiveThreads()
      activateLayers(true)
    },

    decrementPointer() {
      // Deactivate previous layers
      activateLayers(false)

      // TODO:
      //  pointer = max(0, pointer - 1)
      //   _OR_
      //  const minId = allThreads.reduce((acc, { idBounds: [start, _] }) => Math.min(acc, start), +Infinity)
      //  pointer = max(minId, pointer - 1)
      pointer--

      // Activate new layers
      updateActiveThreads()
      activateLayers(true)
    },

    animate() {
      // TODO: Activate persistent layers
      activeLayers.forEach((layer) => {
        layer.scenes.forEach((scene) => {
          (scene as AnimatedScene).animate?.(app)
        })
      })
    },

    render(renderer: THREE.WebGLRenderer) {
      const cam = app.getCamera()

      activeLayers.forEach((layer) => {
        layer.scenes.forEach((scene) => {
          renderer.render(scene.scene, cam)

          // TODO: Create AnimatedScene.afterRender() method
          // Overlays next scene on top of this one
          renderer.clearDepth()
          // Prevents next scene from clearing the previous scene's buffer
          renderer.autoClear = false
        })
      })

      // TODO: Render persistent layers
    }
  }
}