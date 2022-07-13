import { Layer } from "../../collection/layer/Layer"
import debugPanel from "./persistent/debug/debugPanel"
import hud from "./persistent/hud/hud"
import transitionLayer from "./persistent/transition/transitionLayer"


type PersistentLayers = Layer[]
export const persistentLayers: PersistentLayers = [
  debugPanel,
  // hud,
  transitionLayer
]