import { Thread } from "../../collection/thread/Thread"
import homeThread from "./home/thread"
import starWarsThread from "./star_wars/thread"
import testSvgThread from "./test-svg/thread"
import testThread from "./test/thread"


export const localThreads: Thread[] = [
  homeThread,
  testSvgThread,
  testThread,
  starWarsThread,
]