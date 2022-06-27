import * as THREE from "three"

import { App } from "../../App"
import { AppScene, genericSetActive } from "./AppScene"


export interface StaticScene extends AppScene { }

type StaticSceneSetup = (this: StaticScene, app: App) => void
type CreateStaticScene = (setup: StaticSceneSetup) => StaticScene

export const createStaticScene: CreateStaticScene = (setup) => ({
  scene: new THREE.Scene(),
  setup,

  setActive(this: StaticScene, active: boolean) {
    genericSetActive(this, active)
  }
})