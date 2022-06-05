import * as THREE from 'three'


interface App {
  scene: THREE.Scene,
  cam: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer,

  resize: (this: App) => void,
  animate: (this: App) => void,
  // _animate: (this: App) => void,
  render: (this: App) => void
}

const init = (): App => {
  const scene = new THREE.Scene()

  const { innerWidth: w, innerHeight: h } = window
  const s = Math.min(w, h)
  const s_2 = s/2
  const cam = new THREE.OrthographicCamera(
    -s_2, +s_2, // left, right
    +s_2, -s_2, // top, bottom
    0.1, 1000)  // near, far

  cam.position.z = 200

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(s, s)
  document.body.appendChild(renderer.domElement)

  return {
    scene,
    cam,
    renderer,
    resize(this: App) {
      const { innerWidth: w, innerHeight: h } = window
      const s = Math.min(w, h)
      const s_2 = s/2

      this.cam.left = -s_2
      this.cam.right = +s_2
      this.cam.top = +s_2
      this.cam.bottom = -s_2
      this.cam.updateProjectionMatrix()

      this.renderer.setSize(s, s)
    },
    animate(this: App) {},
    render(this: App) {
      renderer.render(scene, cam)
    }
  }
}

const main = (app: App) => {
  let cube: THREE.Mesh
  { // Scene 0: setup
    const geometry = new THREE.BoxGeometry(100, 100, 100)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })

    cube = new THREE.Mesh(geometry, material)
    cube.position.z = -50

    app.scene.add(cube)
  }

  // Animation loop
  app.animate = () => {
    requestAnimationFrame(app.animate)

    { // Scene 0: animate
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
    }

    app.render()
  }

  app.animate()
}

window.onresize = () => {
  app.resize()
}

const app = init()
main(app)