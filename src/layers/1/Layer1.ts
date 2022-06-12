import { createLayer } from "../../Layer"
import scene0 from "./scenes/Scene0"
import scene1 from "./scenes/Scene1"
import scene2 from "./scenes/Scene2"


const layer1 = createLayer(
  scene2,
  scene1,
  scene0
)

export default layer1