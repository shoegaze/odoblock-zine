import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../../../AnimatedScene"
import { App } from "../../../App"


export default createAnimatedScene(
  function init(this: AnimatedScene, _) {
    const geo = new THREE.PlaneGeometry(413.75, 413.75)
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        'u_time': { value: 0.0 },
        'u_resolution': { value: new THREE.Vector2(0.0, 0.0) },
        'u_speed': { value: 3.0 },
      },
      vertexShader: `
        varying vec2 v_uv;

        void main() {
          v_uv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 v_uv;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_speed;

        const float PI = 3.1415;
        const float TWO_PI = 2.0*PI;

        void main() {
          vec2 st = v_uv;
          st -= 0.5;
          //st.x *= u_resolution.x/u_resolution.y;

          float r = length(st);

          float ampl = 0.5*r;
          float offset = 0.5;
          float freq = -0.5*TWO_PI*r;
          float phase = u_time*u_speed;

          float b = ampl*cos(freq + phase) + offset;
          float t = b;

          vec3 col = mix(
              vec3(0.50, 0.66, 0.27),
              vec3(0.75, 0.41, 0.55),
              t
          );

          gl_FragColor = vec4(col, 1.0);
        }
      `
    })


    const plane = new THREE.Mesh(geo, mat)
    // TODO: Calculate from
    plane.position.z = -500 + 0.1
    this.scene.add(plane)
  },

  function animate(this: AnimatedScene, app: App) {
    const plane = this.scene.children[0] as THREE.Mesh

    { // Update transform
      // TODO: Calculate from app.camera settings
      const zOffset = -500 + 0.5
      const fwd = new THREE.Vector3(0.0, 0.0, zOffset)
      fwd.applyQuaternion(app.cam.quaternion)

      const pos = app.cam.position.clone().add(fwd)
      plane.position.copy(pos)

      const rot = app.cam.rotation.clone()
      plane.rotation.copy(rot)
    }

    { // Update uniforms
      const mat = plane.material as THREE.ShaderMaterial

      mat.uniforms.u_time.value = app.clock.getElapsedTime()
      app.renderer.getSize(mat.uniforms.u_resolution.value)

      mat.uniformsNeedUpdate = true
    }
  }
)