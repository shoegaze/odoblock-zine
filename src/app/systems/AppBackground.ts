import * as THREE from "three"

import { App } from "../App"


interface Background {
  scene: THREE.Scene,
  cam: THREE.Camera,

  updateUniforms(app: App): void
}

const createAppBackground = (sz: THREE.Vector2): Background => {
  const { x: w, y: h } = sz

  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(
    -w / 2, +w / 2, // left, right
    +h / 2, -h / 2, // top, bottom
    0.1, 1.1        // near, far
  )

  const geo = new THREE.PlaneBufferGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      'u_color0': { value: new THREE.Color(0.50, 0.66, 0.27) },
      'u_color1': { value: new THREE.Color(0.66, 0.45, 0.72) },
      'u_resolution': { value: new THREE.Vector2(0.0, 0.0) },
      'u_time': { value: 0.0 },
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

      uniform vec3 u_color0;
      uniform vec3 u_color1;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;

      const float PI = 3.1415;
      const float TWO_PI = 2.0*PI;

      void main() {
        vec2 st = v_uv;
        st -= 0.5;
        st.x *= u_resolution.x/u_resolution.y;

        float r = length(st);

        float ampl = 0.5*r;
        float offset = 0.5;
        float freq = -0.5*TWO_PI*r;
        float phase = u_time*u_speed;

        float b = ampl*cos(freq + phase) + offset;
        float t = b;

        vec3 col = mix(
            u_color0,
            u_color1,
            t
        );

        gl_FragColor = vec4(col, 1.0);
      }
    `
  })

  const plane = new THREE.Mesh(geo, mat)
  plane.position.z = -1.0
  scene.add(plane)


  return {
    scene,
    cam,

    updateUniforms(app: App) {
      mat.uniforms.u_time.value = app.clock.getElapsedTime()
      mat.uniforms.u_resolution.value = app.getRendererSize()

      mat.uniformsNeedUpdate = true
    }
  }
}

export default createAppBackground