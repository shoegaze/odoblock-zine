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
type CreateAudioScene = (setup: AudioSceneCallback, options: HowlOptions) => AudioScene

export const createAudioScene: CreateAudioScene = (setup, options) => {
  return {
    sound: new Howl({
      ...options,
    }),

    updateStereo(cam): void {
      const dx = cam.position.x - this.scene.position.x
      const spread = 50.0
      const stereo = clamp(dx / spread, -1.0, +1.0)

      console.group(this)
      console.log('stereo', stereo)
      console.log(this.sound.stereo())
      console.groupEnd()

      this.sound.stereo(stereo)
    },

    updateVolume(cam): void {
      const dist = cam.position.z - this.scene.position.z
      const spread = layersDistance / 2.0
      // TODO: Convert to log scale?
      const volume = Math.min(spread / dist, 1.0)

      // console.group(this)
      // console.log('volume', volume)
      // console.groupEnd()

      this.sound.volume(volume)
    },


    scene: new THREE.Scene(),
    setup(this, app) {
      (setup as (this: AppScene, app: App) => void).call(
        this, app
      )

      // const sound = (this as AudioScene).sound
      // const { x, y, z } = this.scene.position

      // const dir = new THREE.Vector3(0, 0, -1.0)
      // dir.applyQuaternion()

      // sound.pos(x, y, z)
      // sound.orientation(TODO)
    },

    setActive(this, active) {
      // TODO: Make this configurable from options?
      (this as AudioScene).sound?.mute(!active)

      genericSetActive(this, active)
    },
  }
}