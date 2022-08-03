import { createThread } from "../../../collection/thread/Thread"
import bgmLayer from "./layer/bgm"
import homeLayer from "./layer/home"


const homeThread = createThread(
  "Home",
  [
    homeLayer,
    bgmLayer
  ]
)

export default homeThread