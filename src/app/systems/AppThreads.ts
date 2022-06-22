import { Layer } from "../collection/layer/Layer"
import { Thread } from "../collection/thread/Thread"


export interface AppThread {
  getActiveThreads: () => Thread[]
  getActiveLayers: () => Layer[]
  incrementPointer: () => void
  decrementPointer: () => void
}

export const createAppThread = (): AppThread => {
  const allThreads: Thread[] = []

  let pointer = 0
  let activeThreads: Thread[] = []
  let activeLayers: Layer[] = []

  const updateActiveThreads = (): void => {
    activeThreads = allThreads.filter(({ idBounds: [start, end] }) => start <= pointer && pointer <= end)
    // TODO: Optimize arrays concatenation with `.concat()`
    //  > Maybe activeLayers.length is small enough?
    activeLayers = activeThreads.reduce((acc, { layers }) => [...acc, ...layers], [] as Layer[])
  }

  return {
    getActiveThreads() {
      return activeThreads
    },

    getActiveLayers() {
      return activeLayers
    },

    incrementPointer() {
      pointer++
      updateActiveThreads()
    },

    decrementPointer() {
      pointer--
      updateActiveThreads()
    }
  }
}