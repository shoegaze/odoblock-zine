import { Layer } from "../../collection/layer/Layer"
import debugPanel from "./persistent/debug/debugPanel"
import transitionLayer from "./persistent/transition/transitionLayer"


type PersistentLayers = Layer[]
export const persistentLayers: PersistentLayers = [
  debugPanel,
  transitionLayer
]