import * as THREE from "three"

import { App } from "../App"
import { Layer } from "../collection/layer/Layer"
import { AnimatedScene } from "../collection/scene/AnimatedScene"
import { createThread, Thread } from "../collection/thread/Thread"


export interface AppThreads {
  hasThread: (thread: Thread) => boolean
  addThread: (thread: Thread) => void
  addPersistentLayer: (layer: Layer) => void

  getAllThreads: () => Thread[]
  getThread: (name: string) => Thread | undefined
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
  const persistentThread: Thread = createThread(".persistent", [])

  // TODO: Optimize by sorting by zId
  const allThreads: Thread[] = []

  let activeThreads: Thread[] = []
  let activeLayers: Layer[] = []
  // let bounds: [number, number] = [0, 0]
  let pointer = 0

  const updateActiveThreads = (): void => {
    // TODO: Include the one after the current pointer, too
    activeThreads = allThreads.filter(({ zIdBounds: [start, end] }) => (
      start <= pointer && pointer <= end
    ))

    // TODO: Optimize arrays concatenation with `.concat()`
    //  > Maybe activeLayers.length is small enough?
    // TODO: Activate current+next pointer layers?
    activeLayers = activeThreads.reduce((acc, { layers }) => ([
      ...acc,
      ...layers.filter((layer) => layer.zId === pointer)
    ]), [] as Layer[])
  }

  const setLayersActive = (active: boolean): void => {
    activeLayers.forEach(layer => {
      layer.setActive(active)
    })
  }

  return {
    hasThread(thread) {
      return allThreads.find((t) => t === thread) !== undefined
    },

    addThread(thread) {
      // Ignore duplicates
      //  Is this necessary?
      if (this.hasThread(thread)) {
        console.warn(`Thread "${thread.name}" is already present`)
        return
      }

      allThreads.push(thread)
      // TODO: Just insert the thread sorted = O(n)
      allThreads.sort(({ zIdBounds: [startA, _endA] }, { zIdBounds: [startB, _endB] }) => (
        startA - startB
      ))

      // Setup
      thread.layers.forEach((layer) => {
        layer.scenes.forEach((appScene) => {
          appScene.setup(app)
          appScene.scene.translateZ(layer.zPos)
        })
      })

      updateActiveThreads()
      setLayersActive(true)

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

    addPersistentLayer(layer) {
      if (persistentThread.hasLayer(layer)) {
        console.warn(`Layer ${layer} is already present in AppThreads/.persistent`)
        return
      }

      persistentThread.addLayer(layer)

      // Set up this layer
      // TODO: Factor this out
      layer.scenes.forEach((scene) => {
        scene.setup(app)
        scene.scene.translateZ(layer.zPos)
      })
    },

    getAllThreads() {
      return allThreads
    },

    getThread(name) {
      return allThreads.find((thread) => (
        thread.name === name
      ))
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
      const start = allThreads.reduce((acc, { zIdBounds: [start, _] }) => Math.min(acc, start), +Infinity)
      const end = allThreads.reduce((acc, { zIdBounds: [_, end] }) => Math.max(acc, end), -Infinity)
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
      setLayersActive(false)

      // TODO:
      //  const maxId = allThreads.reduce((acc, { idBounds: [_, end] }) => Math.max(acc, end), -Infinity)
      //  pointer = min(maxId, pointer + 1)
      pointer++

      // Activate new layers
      updateActiveThreads()
      setLayersActive(true)
    },

    decrementPointer() {
      // Deactivate previous layers
      setLayersActive(false)

      // TODO:
      //  pointer = max(0, pointer - 1)
      //   _OR_
      //  const minId = allThreads.reduce((acc, { idBounds: [start, _] }) => Math.min(acc, start), +Infinity)
      //  pointer = max(minId, pointer - 1)
      pointer--

      // Activate new layers
      updateActiveThreads()
      setLayersActive(true)
    },

    animate() {
      // TODO: Activate persistent layers
      activeLayers.forEach((layer) => {
        layer.scenes.forEach((scene) => {
          (scene as AnimatedScene).animate?.(app)
        })
      })

      // HACK: Animate persistent layers
      persistentThread.layers.forEach((layer) => {
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

      // HACK: Render persistent layers
      persistentThread.layers.forEach((layer) => {
        layer.scenes.forEach((scene) => {
          renderer.render(scene.scene, cam)
        })
      })
    }
  }
}