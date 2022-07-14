import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { Howl, HowlOptions } from "howler"

import { App } from "../../App"
import { AppScene, genericSetActive } from "./AppScene"


export interface AudioScene extends AppScene {
  sound: Howl

  updateStereo: (cam: THREE.Camera) => void
  updateVolume: (cam: THREE.Camera) => void
}


type AudioSceneCallback = (this: AudioScene, app: App) => void
type AudioSceneOptions = { stereoSpread: number, volumeSpread: number } & Omit<HowlOptions, 'html5'>
type CreateAudioScene = (setup: AudioSceneCallback, options: AudioSceneOptions) => AudioScene

export const createAudioScene: CreateAudioScene = (setup, options) => {
  return {
    sound: new Howl({
      ...options,
    }),

    updateStereo(cam): void {
      const dx = this.scene.position.x - cam.position.x
      const spread = options.stereoSpread
      const stereo = clamp(dx / spread, -1.0, +1.0)

      this.sound.stereo(stereo)
    },

    updateVolume(cam): void {
      const dist = cam.position.distanceTo(this.scene.position)
      const spread = options.volumeSpread
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