import { Layer } from "../../collection/layer/Layer"
// Persistent layers
import transitionLayer from "./persistent/transition/transitionLayer"
import debugSquareLayer from "./persistent/debug/debugSquareLayer"
// Local layers
import homeLayer from "./0/homeLayer"
import layer1 from "./1/layer1"


type LayersList = Array<Layer>

export const persistentLayers: LayersList = [
  transitionLayer,
  debugSquareLayer
]

export const localLayers: LayersList = [
  homeLayer,
  layer1
]