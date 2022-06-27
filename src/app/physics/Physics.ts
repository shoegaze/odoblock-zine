import * as THREE from "three"


export interface Physics {
  readonly mass: number
  readonly position: THREE.Vector3
  readonly acceleration: THREE.Vector3
  readonly velocity: THREE.Vector3

  update(this: Physics, dt: number): void
  addForce(this: Physics, force: THREE.Vector3): void
}

export const createPhysics = (mass: number, position: THREE.Vector3): Physics => ({
  mass,
  position,
  acceleration: new THREE.Vector3(),
  velocity: new THREE.Vector3(),

  update(this: Physics, dt: number) {
    // NOTE: THREE.Vector methods modify the vector, so we need to clone it
    const dp = this.velocity.clone().multiplyScalar(dt)
    this.position.add(dp)

    const dv = this.acceleration.clone().multiplyScalar(dt)
    this.velocity.add(dv)
  },

  addForce(this: Physics, force: THREE.Vector3) {
    // No clone needed if we assume force is only passed in as a parameter?
    const da = force.clone().divideScalar(this.mass)
    this.acceleration.add(da)
  }
})