import * as THREE from "three"

import { App } from "../../App"
import { AppScene, genericSetActive } from "./AppScene"


type AnimatedSceneMethod = (this: AnimatedScene, app: App) => void

export interface AnimatedScene extends AppScene {
  animate: AnimatedSceneMethod,
  // beforeRender: AnimatedSceneMethod,
  // afterRender: AnimatedSceneMethod
}


type AnimatedSceneCallback = (this: AnimatedScene, app: App) => void
type CreateAnimatedScene = (setup: AnimatedSceneCallback, animate: AnimatedSceneCallback) => AnimatedScene

export const createAnimatedScene: CreateAnimatedScene = (setup, animate) => ({
  animate,


  scene: new THREE.Scene(),
  setup: setup as (this: AppScene, app: App) => void,

  setActive(this, active) {
    genericSetActive(this, active)
  },
})