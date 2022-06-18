import * as THREE from "three"


export default class Physics {
  public readonly mass: number
  public readonly position: THREE.Vector3
  public readonly acceleration: THREE.Vector3 = new THREE.Vector3()
  public readonly velocity: THREE.Vector3 = new THREE.Vector3()

  constructor(mass: number, position: THREE.Vector3) {
    this.mass = mass
    this.position = position
  }

  public update(dt: number): void {
    // NOTE: THREE.Vector methods modify the vector, so we need to clone it
    const dp = this.velocity.clone().multiplyScalar(dt)
    this.position.add(dp)

    const dv = this.acceleration.clone().multiplyScalar(dt)
    this.velocity.add(dv)
  }

  public addForce(force: THREE.Vector3): void {
    // No clone needed if we assume force is only passed in as a parameter?
    const da = force.clone().divideScalar(this.mass)
    this.acceleration.add(da)
  }
}