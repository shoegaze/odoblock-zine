import { Howl, HowlOptions as AudioSceneOptions } from "howler"
import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"

import { App } from "../../App"
import { AppScene, genericSetActive } from "./AppScene"


// TODO
export interface AudioScene extends AppScene {
  sound: Howl,
}


type AudioSceneCallback = (this: AudioScene, app: App) => void
type AudioSceneOptions = {
  src: string[],
}
type CreateAudioScene = (setup: AudioSceneCallback, options: AudioSceneOptions) => AudioScene

export const createAudioScene: CreateAudioScene = (setup, options) => {
  return {
    sound: new Howl({
      ...options,
    }),


    scene: new THREE.Scene(),
    setup(this, app) {
      (setup as (this: AppScene, app: App) => void).call(
        this, app
      )

      const sound = (this as AudioScene).sound
      const { x, y, z } = this.scene.position

      const dir = new THREE.Vector3(0, 0, -1.0)
      dir.applyQuaternion()

      sound.pos(x, y, z)
      sound.orientation(TODO)
    },

    setActive(this, active) {
      genericSetActive(this, active)
    },
  }
}