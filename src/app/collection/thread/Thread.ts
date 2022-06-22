import { Layer } from "../layer/Layer"


export interface Thread {
  layers: Layer[]
  idBounds: [number, number] // [start, end]
}

export const createThread = (...layers: Layer[]): Thread => ({
  layers,
  idBounds: [
    // TODO: Combine into one pass
    layers.reduce((acc, layer) => Math.min(acc, layer.zId), +Infinity),
    layers.reduce((acc, layer) => Math.max(acc, layer.zId), -Infinity)
  ]
})