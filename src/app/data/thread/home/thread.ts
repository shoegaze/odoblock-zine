import { createThread } from "../../../collection/thread/Thread";
import homeLayer from "./layer/homeLayer";


const home = createThread(
  "Home",
  homeLayer
)

export default home