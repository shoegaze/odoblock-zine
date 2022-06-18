import { Layer } from './Layer'


export interface Thread {
  layers: Array<Layer>
}

// TODO:
export const createThread = (...layers: Array<Layer>): Thread => ({
  layers
})