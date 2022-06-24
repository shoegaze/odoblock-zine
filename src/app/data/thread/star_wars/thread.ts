import { createThread } from "../../../collection/thread/Thread"
import text0 from "./layer/text0"
import text1 from "./layer/text1"
import text2 from "./layer/text2"


const starWarsThread = createThread(
  "Star Wars",
  text0,
  text1,
  text2
)

export default starWarsThread