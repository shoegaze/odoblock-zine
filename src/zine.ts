import * as THREE from 'three'


const main = () => {
  // Setup
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  cam.position.z = 5

  const renderer = new THREE.WebGLRenderer()

  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Test scene
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff00ff
  })
  const cube = new THREE.Mesh(geometry, material)

  scene.add(cube)

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, cam)
  }

  animate()
}

main()