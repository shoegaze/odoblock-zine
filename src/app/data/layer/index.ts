import { Layer } from "../../collection/Layer";
import HomeLayer from "./0/HomeLayer";
import Layer1 from "./1/Layer1";
import DebugSquareLayer from "./persistent/debug/DebugSquareLayer";
import TransitionLayer from "./persistent/transition/TransitionLayer";


type LayersList = Array<Layer>

export const persistentLayers: LayersList = [
  TransitionLayer,
  DebugSquareLayer
]

export const localLayers: LayersList = [
  HomeLayer,
  Layer1
]