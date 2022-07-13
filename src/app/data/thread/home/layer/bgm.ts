import { createLocalLayer, layersDistance } from "../../../../collection/layer/Layer";
import { createAudioScene } from "../../../../collection/scene/AudioScene";


const bgmLayer = createLocalLayer(0, [
  createAudioScene(
    function setup() { },

    {
      stereoSpread: 50.0,
      volumeSpread: layersDistance / 2.0,

      src: ['audio/mp3/bgm-1.mp3'],
      autoplay: true,
      loop: true,
    }
  )
])

export default bgmLayer