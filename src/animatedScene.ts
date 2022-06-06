import * as THREE from "three"
import { App } from "./app"


type AnimatedSceneMethod = (this: AnimatedScene, app: App) => void
// type AnimatedSceneMethod<T extends AnimatedScene> = (this: T, app: App) => void

export interface AnimatedScene {
  scene: THREE.Scene,

  setup: AnimatedSceneMethod,
  animate: AnimatedSceneMethod,
  // resize: AnimatedSceneMethod,
  // afterRender: AnimatedSceneMethod,
}

type CreateAnimatedScene = (setup: AnimatedSceneMethod, animate: AnimatedSceneMethod) => AnimatedScene

export const createAnimatedScene: CreateAnimatedScene = (setup, animate) => ({
  scene: new THREE.Scene(),
  setup,
  animate
})