import * as THREE from "three"
import { App } from "./App"

import { Physics, createPhysics } from "./physics/Physics"


type PhysicsLoopFn = (physics: Physics, dt: number) => void

interface CameraController {
  startPhysicsLoop(beforeUpdate?: PhysicsLoopFn, afterUpdate?: PhysicsLoopFn): void
  endPhysicsLoop(): void
}

const createCameraController = (cam: THREE.Camera): CameraController => {
  // TODO: Inject via options
  const mass = 1.0
  const physics = createPhysics(mass, cam.position)
  let physicsLoopID: NodeJS.Timer | null = null

  const syncCamera = (): void => {
    cam.position.copy(physics.position)
  }

  return {
    startPhysicsLoop(beforeUpdate?, afterUpdate?): void {
      if (physicsLoopID) {
        console.error('CameraDragger.startPhysicsLoop: Can only have one loop active')
        return
      }

      // TODO: Auto-detect level of physics precision (fps) from cpu speed?
      const fps = 120
      const dt = 1.0 / fps
      const dtMs = 1000.0 * dt

      physicsLoopID = setInterval(() => {
        beforeUpdate?.(physics, dt)
        physics.update(dt)
        afterUpdate?.(physics, dt)

        syncCamera()
      }, dtMs)
    },

    endPhysicsLoop(): void {
      if (!physicsLoopID) {
        console.error('CameraDragger.endPhysicsLoop: No loop to end')
        return
      }

      clearInterval(physicsLoopID)
      physicsLoopID = null
    },
  }
}

export default createCameraController