import { Layer } from "../../collection/Layer";
import HomeLayer from "./0/HomeLayer";
import Layer1 from "./1/Layer1";
import DebugSquareLayer from "./persistent/debug/DebugSquareLayer";
import TransitionLayer from "./persistent/transition/TransitionLayer";


type LayersMap = { [key: string]: Layer }

// TODO: Store tuple [layer, id] in export object
export const persistentLayers: LayersMap = {
  TransitionLayer,
  DebugSquareLayer
}

// TODO: Store tuple [layer, id] in export object
export const localLayers: LayersMap = {
  HomeLayer,
  Layer1
}