import { App } from "../App"
import { AudioScene } from "../collection/scene/AudioScene"


export interface AppSound {
  registerAudioScenes: () => void
  updateAudioParameters: () => void
}

export const createAppSound = (app: App): AppSound => {
  const threads = app.getThreads()
  const cam = app.getCamera()

  let audioScenes: AudioScene[] = []

  return {
    registerAudioScenes() {
      audioScenes = threads.getActiveScenes()
        .filter((scene) => (scene as AudioScene).sound) as AudioScene[]
    },

    updateAudioParameters() {
      // if (!cam.moved) {
      //   return
      // }

      audioScenes.forEach((scene) => {
        scene.updateStereo(cam)
        scene.updateVolume(cam)
      })
    }
  }
}