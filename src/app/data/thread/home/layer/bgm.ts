import { createLocalLayer } from "../../../../collection/layer/Layer";
import { createAudioScene } from "../../../../collection/scene/AudioScene";


const bgmLayer = createLocalLayer(0, [
  createAudioScene(
    function setup() {},

    {
      src: ['audio/mp3/bgm-1.mp3'],
      autoplay: true,
      loop: true,
      html5: true,

      onload: (soundId) => {
        console.log(`Howler loaded audio with id=${soundId}`)
      },

      onloaderror: (soundId, error) => {
        console.error(`Howler failed to load audio with id=${soundId}`)
        console.error(error)
      },

      onplay: (soundId) => {
        console.log(`Howler playing audio with id=${soundId}`)
      },

      onend: (soundId) => {
        console.log(`Howler finished playing audio with id=${soundId}`)
      }
    }
  )
])

export default bgmLayer