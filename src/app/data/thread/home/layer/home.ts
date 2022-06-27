import { Howl, Howler } from 'howler'
import * as THREE from 'three'

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createStaticScene } from "../../../../collection/scene/StaticScene"


const homeLayer = createLocalLayer(0, [
  createStaticScene(
    function setup(this) {
      { // Howler
        const sound = new Howl({
          src: ['audio/mp3/bgm-1.mp3'],
          autoplay: false,
          loop: true,
          volume: 0.5,
          onload: (soundId) => {
            console.log(`Howler loaded audio with id=${soundId}`)
            sound.play()
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
        })

        // sound.play()
      }

      { // THREE
        const geo = new THREE.PlaneGeometry(50.0, 50.0)
        const mat = new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('./img/jpg/mando.jpg'),
        })

        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.z = 0.0

        this.scene.add(mesh)
      }
    }
  )
])

export default homeLayer