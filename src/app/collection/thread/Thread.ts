import { Layer } from "../layer/Layer"


export interface Thread {
  layers: Layer[]
}

export const createThread = (...layers: Layer[]): Thread => ({
  layers: layers.sort((l, r) => l.id - r.id)
})

type LayersGroupKey = string
type LayersGroup = {
  [key: LayersGroupKey]: Layer[]
}

type ThreadGroupByLayers = (grouper: (layer: Layer) => LayersGroupKey, threads: Thread[]) => LayersGroup
export const threadGroupByLayers: ThreadGroupByLayers = (grouper, threads) => {
  let layers: LayersGroup = {}

  threads.forEach(thread => {
    const grouped = thread.layers.reduce((acc, layer) => {
      const group = grouper(layer)

      if (!acc[group]) {
        acc[group] = []
      }

      acc[group].push(layer)
      return acc
    }, {} as LayersGroup)

    // Is this behavior what we want?
    //  What happens when there are duplicate layer ids?
    // layers = { ...layers, ...grouped }

    // Or is this it?
    for (const g in grouped) {
      layers[g] = (layers[g] || []).concat(grouped[g])
    }
  })

  return layers
}