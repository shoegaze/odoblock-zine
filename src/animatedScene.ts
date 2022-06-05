import * as THREE from "three"
import { App } from "./app"


type AnimatedSceneMethod = (this: AnimatedScene, app: App) => void

export interface AnimatedScene {
  scene: THREE.Scene,

  setup: AnimatedSceneMethod,
  animate: AnimatedSceneMethod,
  // resize: AnimatedSceneMethod,
  // afterRender: AnimatedSceneMethod,
}

export const createAnimatedScene = (setup: AnimatedSceneMethod, animate: AnimatedSceneMethod): AnimatedScene => ({
  scene: new THREE.Scene(),
  setup,
  animate
})