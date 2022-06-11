import * as THREE from "three"
import Physics from "./Physics"


export default class CameraDragger {
  private cam: THREE.Camera
  private physics: Physics
  private loopId: NodeJS.Timer | null = null
  private lastDrag: number = 0

  constructor(cam: THREE.Camera) {
    this.cam = cam

    const mass = 1.0
    this.physics = new Physics(mass, cam.position)
  }

  public startPhysicsLoop() {
    if (this.loopId) {
      console.error('CameraDragger.startPhysicsLoop: Can only have one loop active')
      return
    }

    const fps = 30
    const dt = 1000.0 / fps

    this.loopId = setInterval(() => {
      this.physics.update(dt)
    }, dt)
  }

  public endPhysicsLoop() {
    if (!this.loopId) {
      console.error('CameraDragger.endPhysicsLoop: No loop to end')
      return
    }

    clearInterval(this.loopId)
    this.loopId = null
  }
}