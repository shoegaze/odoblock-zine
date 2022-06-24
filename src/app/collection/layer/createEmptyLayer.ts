import { createLocalLayer } from "./Layer";


const createEmptyLayer = (zId: number) => (
  createLocalLayer(zId)
)

export default createEmptyLayer