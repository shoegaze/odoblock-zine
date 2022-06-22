import { Layer } from "../../collection/layer/Layer"
// Persistent layers
import transitionLayer from "./persistent/transition/createTransitionLayer"
import debugSquareLayer from "./persistent/debug/createDebugPanel"
// Local layers
import homeLayer from "./createHomeLayer"
import layer1 from "./createLayer1"


type LayersList = Array<() => Layer>

export const persistentLayers: LayersList = [
  transitionLayer,
  debugSquareLayer
]

export const localLayers: LayersList = [
  homeLayer,
  layer1
]