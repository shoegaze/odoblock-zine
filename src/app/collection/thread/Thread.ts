import { Layer } from "../layer/Layer"


export interface Thread {
  name: string
  layers: Layer[]
  idBounds: [number, number] // [start, end]

  hasLayer: (layer: Layer) => boolean
  addLayer: (layer: Layer) => void
}

export const createThread = (name: string, layers: Layer[]): Thread => ({
  name,
  layers,
  idBounds: [
    // TODO: Combine into one pass
    layers.reduce((acc, layer) => Math.min(acc, layer.zId), +Infinity),
    layers.reduce((acc, layer) => Math.max(acc, layer.zId), -Infinity)
  ],

  hasLayer(layer) {
    return this.layers.find((l) => l === layer) !== undefined
  },

  addLayer(layer) {
    this.layers.push(layer)
  }
})