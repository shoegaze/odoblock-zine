import { clamp } from "three/src/math/MathUtils"

import { AppScene } from "../collection/scene/AppScene"
import { Layer, zPosToId } from "../collection/layer/Layer"
import HomeLayer from "../data/layer/0/homeLayer"
import { App } from "../App"


export interface AppLayers {
  getActiveLayer: () => Layer
  getPersistentLayers: () => Array<Layer>
  getLocalLayers: () => Array<Layer>
  getClosestLayer: () => Layer

  addPersistentLayer: (layer: Layer) => void
  addLocalLayer: (layer: Layer) => void

  setActiveLayer: (id: number) => void
}

type CreateAppLayers = (app: App, cam: THREE.Camera) => AppLayers
export const createAppLayers: CreateAppLayers = (app, cam) => {
  // Initialize with HomeLayer for type safety
  let activeLayer = HomeLayer

  const localLayers: Array<Layer> = [HomeLayer]
  const persistentLayers: Array<Layer> = []

  return {
    getActiveLayer(): Layer {
      return activeLayer
    },

    getPersistentLayers(): Array<Layer> {
      return persistentLayers
    },

    getLocalLayers(): Array<Layer> {
      return localLayers
    },

    addPersistentLayer(layer: Layer): void {
      persistentLayers.push(layer)

      layer.scenes.forEach((appScene: AppScene) => {
        appScene.setup(app)
      })

      layer.setActive(true)
    },

    // What happens when [l_0, ..., undefined, ..., l_{n-1}] ?
    addLocalLayer(layer: Layer) {
      localLayers.push(layer)

      layer.scenes.forEach((as: AppScene) => {
        as.setup(app)

        // TODO: Do this only when the containing layer is active ... O(n_obj)?
        // Convert to all objects to their layer-spaces
        as.scene.translateZ(layer.zPos)
      })

      layer.setActive(false)
    },

    // TODO: Pre-cache next n layer(s)
    setActiveLayer(id: number): void {
      const layer = localLayers[id]

      if (!layer) {
        console.error(`No layer with id ${id}`)
        return
      }

      activeLayer.setActive(false)
      activeLayer = layer
      activeLayer.setActive(true)
    },

    getClosestLayer(): Layer {
      const z = cam.position.z

      // We can assume localLayers.length >= 1
      if (z >= 0.0) {
        return localLayers[0]
      }

      const lastIndex = localLayers.length - 1
      const lastLayer = localLayers[lastIndex]
      const zLast = lastLayer.zPos
      if (z <= zLast) {
        return lastLayer
      }

      const idNow = zPosToId(z)
      const layerNow = localLayers[idNow]

      // Can we assume that idNow :: [1, n-1] ?
      const idPrev = clamp(idNow - 1, 0, lastIndex)
      const layerPrev = localLayers[idPrev]

      const distNow = Math.abs(z - layerNow.zPos)
      const distPrev = Math.abs(z - layerPrev.zPos)

      return distNow < distPrev ? layerNow : layerPrev
    }
  }
}