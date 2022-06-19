import * as THREE from "three"

import { App } from "../../App"


export interface AppScene {
  scene: THREE.Scene,

  setup: (this: AppScene, app: App) => void,
  // resize: (this: Scene, app: App) => void,

  setActive: (this: AppScene, active: boolean) => void
}

export const genericSetActive = (appScene: AppScene, active: boolean) => {
  const scene = appScene.scene
  scene.visible = active
  scene.autoUpdate = active
  scene.matrixAutoUpdate = active

  if (active) {
    scene.updateMatrix()
  }
}