import * as THREE from "three"

import { App } from "../app/App"


type AnimatedSceneMethod = (this: AnimatedScene, app: App) => void
// type AnimatedSceneMethod<T extends AnimatedScene> = (this: T, app: App) => void

export interface AnimatedScene {
  scene: THREE.Scene,

  setup: AnimatedSceneMethod,
  animate: AnimatedSceneMethod,
  // resize: AnimatedSceneMethod,
  // afterRender: AnimatedSceneMethod,

  setActive: (this: AnimatedScene, active: boolean) => void
}


type CreateAnimatedScene = (setup: AnimatedSceneMethod, animate: AnimatedSceneMethod) => AnimatedScene

export const createAnimatedScene: CreateAnimatedScene = (setup, animate) => ({
  scene: new THREE.Scene(),
  setup,
  animate,

  setActive(this: AnimatedScene, active: boolean) {
    this.scene.visible = active
    this.scene.autoUpdate = active
    this.scene.matrixAutoUpdate = active

    if (active) {
      this.scene.updateMatrix()
      this.scene.updateMatrixWorld(true)
    }
  }
})