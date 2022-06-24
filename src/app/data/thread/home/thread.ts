import { createThread } from "../../../collection/thread/Thread"
import homeLayer from "./layer/home"


const homeThread = createThread(
  "Home",
  [
    homeLayer
  ]
)

export default homeThread