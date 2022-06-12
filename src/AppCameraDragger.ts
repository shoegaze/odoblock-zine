import * as THREE from "three"
import Physics from "./Physics"


type PhysicsLoopFn = (physics: Physics, dt: number) => void

export default class CameraDragger {
  private cam: THREE.Camera
  private physics: Physics
  private loopId: NodeJS.Timer | null = null

  constructor(cam: THREE.Camera) {
    this.cam = cam

    const mass = 1.0
    this.physics = new Physics(mass, cam.position)
  }

  private syncCamera(): void {
    this.cam.position.copy(this.physics.position)
  }

  public startPhysicsLoop(beforeUpdate?: PhysicsLoopFn, afterUpdate?: PhysicsLoopFn): void {
    if (this.loopId) {
      console.error('CameraDragger.startPhysicsLoop: Can only have one loop active')
      return
    }

    // TODO: Auto-detect level of physics precision (fps) from cpu speed?
    const fps = 60
    const dt = 1.0 / fps
    const dtMs = 1000.0 * dt

    this.loopId = setInterval(() => {
      beforeUpdate?.(this.physics, dt)
      this.physics.update(dt)
      afterUpdate?.(this.physics, dt)

      this.syncCamera()
    }, dtMs)
  }

  public endPhysicsLoop(): void {
    if (!this.loopId) {
      console.error('CameraDragger.endPhysicsLoop: No loop to end')
      return
    }

    clearInterval(this.loopId)
    this.loopId = null
  }
}