import * as THREE from "three"

import { Physics, createPhysics } from "../physics/Physics"
import { App } from "../App"


type PhysicsLoopFn = (physics: Physics, dt: number) => void

interface CameraController {
  startPhysicsLoop(beforeUpdate?: PhysicsLoopFn, afterUpdate?: PhysicsLoopFn): void
  endPhysicsLoop(): void
}

const createCameraController = (cam: THREE.Camera): CameraController => {
  // TODO: Inject via options
  const mass = 1.0
  const physics = createPhysics(mass, cam.position)
  let physicsLoopId: NodeJS.Timer | null = null

  const syncCamera = (): void => {
    cam.position.copy(physics.position)
  }

  return {
    startPhysicsLoop(beforeUpdate?, afterUpdate?): void {
      if (physicsLoopId) {
        console.error('CameraDragger.startPhysicsLoop: Can only have one loop active')
        return
      }

      // TODO: Auto-detect level of physics precision (fps) from cpu speed?
      const fps = 120
      const dt = 1.0 / fps
      const dtMs = 1000.0 * dt

      physicsLoopId = setInterval(() => {
        beforeUpdate?.(physics, dt)
        physics.update(dt)
        afterUpdate?.(physics, dt)

        syncCamera()
      }, dtMs)
    },

    endPhysicsLoop(): void {
      if (!physicsLoopId) {
        console.error('CameraDragger.endPhysicsLoop: No loop to end')
        return
      }

      clearInterval(physicsLoopId)
      physicsLoopId = null
    },
  }
}

export default createCameraController