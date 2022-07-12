import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { Howl, HowlOptions } from "howler"

import { App } from "../../App"
import { AppScene, genericSetActive } from "./AppScene"
import { layersDistance } from "../layer/Layer"


export interface AudioScene extends AppScene {
  sound: Howl

  updateStereo: (cam: THREE.Camera) => void
  updateVolume: (cam: THREE.Camera) => void
}


type AudioSceneCallback = (this: AudioScene, app: App) => void
type CreateAudioScene = (setup: AudioSceneCallback, options: Omit<HowlOptions, 'html5'>) => AudioScene

export const createAudioScene: CreateAudioScene = (setup, options) => {
  return {
    sound: new Howl({
      ...options,
    }),

    updateStereo(cam): void {
      const dx = this.scene.position.x - cam.position.x
      const spread = 50.0
      const stereo = clamp(dx / spread, -1.0, +1.0)

      this.sound.stereo(stereo)
    },

    updateVolume(cam): void {
      const dist = cam.position.distanceTo(this.scene.position)
      const spread = layersDistance / 2.0
      const volume = Math.min(spread / dist, 1.0)

      this.sound.volume(volume)
    },


    scene: new THREE.Scene(),
    setup(this, app) {
      (setup as (this: AppScene, app: App) => void).call(
        this, app
      )
    },

    setActive(this, active) {
      // TODO: Make this configurable from options?
      (this as AudioScene).sound?.mute(!active)

      genericSetActive(this, active)
    },
  }
}