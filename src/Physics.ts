import * as THREE from "three"


export default class Physics {
  public mass: number
  public position: THREE.Vector3

  private acceleration: THREE.Vector3 = new THREE.Vector3()
  private velocity: THREE.Vector3 = new THREE.Vector3()

  constructor(mass: number, position: THREE.Vector3) {
    this.mass = mass
    this.position = position
  }

  public update(dt: number) {
    this.velocity = this.velocity.add(this.acceleration.multiplyScalar(dt))
    this.position = this.position.add(this.velocity.multiplyScalar(dt))
  }

  public addForce(force: THREE.Vector3) {
    this.acceleration = this.acceleration.add(force)
  }
}