import * as THREE from 'three'


type CreateGraphicsContext = {
  fov: number
  near: number
  far: number
  zMax: number
  zMin: number
}

type CreateAppGraphics = (canvas: HTMLCanvasElement, size: THREE.Vector2, ctx: CreateGraphicsContext) => {
  cam: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
}

const createAppGraphics: CreateAppGraphics = (canvas, size, ctx) => {
  // Square frame
  const s = Math.min(size.x, size.y)

  // TODO: Calculate far from layersDistance
  const cam = new THREE.PerspectiveCamera(
    ctx.fov,  // fov
    s / s,    // aspect
    ctx.near, // near
    ctx.far   // far
  )

  cam.position.z = ctx.zMax


  const renderer = new THREE.WebGLRenderer({
    canvas
  })

  renderer.setSize(s, s)

  // TODO: Disable debug mode in production
  renderer.debug = {
    checkShaderErrors: true
  }

  return {
    cam,
    renderer
  }
}

export default createAppGraphics