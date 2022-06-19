import { Layer } from "./Layer";


export interface Thread {
  layers: Layer[]
}

export const createThread = (...layers: Layer[]): Thread => ({
  layers
})