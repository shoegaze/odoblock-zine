import * as THREE from "three"
import { AnimatedScene, createAnimatedScene } from "../../../AnimatedScene"
import { App } from "../../../App"
import { fadeDistance } from "../../../Layer"


const transitionLayerScene = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    // TODO: Calculate geo size based on screen size
    const geo = new THREE.PlaneGeometry(0.8, 0.8)
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        'u_t': { value: 0.0 },
        'u_color': { value: new THREE.Color(1.0, 0.0, 0.0) },
        'u_resolution': { value: new THREE.Vector2(0.0, 0.0) },
        'u_mouse': { value: new THREE.Vector2(0.0, 0.0) }
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

        uniform float u_t;
        uniform vec3 u_color;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        vec3 lerp(vec3 a, vec3 b, float t) {
          return a * (1.0-t) + b * t;
        }

        void main() {
          vec2 uv = v_uv;

          if (u_t < 1.0e-6) {
            discard;
          }

          vec3 col = lerp(vec3(1.0, 1.0, 1.0), u_color, u_t);
          // col = vec3(clamp(length(uv - u_mouse), 0.0, 1.0) < 0.5);

          gl_FragColor = vec4(col, u_t);
        }
      `
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = 'mesh'
    mesh.position.z = 0.0

    this.scene.add(mesh)
  },

  function animate(this: AnimatedScene, app: App) {
    const mesh = this.scene.getObjectByName('mesh')! as THREE.Mesh

    { // Update uniforms
      const mat = mesh.material as THREE.ShaderMaterial

      // TODO: Use truncated triangle for u_t?
      const zCam = app.cam.position.z
      const zLayer = app.getClosestLayer().zPos
      // https://graphtoy.com/?f1(x,t)=1%20-%20abs(%20(x%20-%204)/2%20)&v1=false&f2(x,t)=max(f1(x),%200)&v2=true&f3(x,t)=&v3=false&f4(x,t)=&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=1&coords=4.64315003434978,1.734851413907519,5.155202479020844
      const t = Math.max(0.0, 1.0 - Math.abs((zCam - zLayer) / fadeDistance))

      { // DEBUG:
        console.log('zCam', zCam)
        console.log('zLayer', zLayer)
        console.log('t', t)
      }

      mat.uniforms.u_t.value = t
      // mat.uniforms.u_color.value = new THREE.Color(1.0, 0.0, 0.0)

      const resolution = new THREE.Vector2()
      app.renderer.getSize(resolution)
      mat.uniforms.u_resolution.value = resolution

      // const mouse = app.getQueuedMousePosition()
      // mat.uniforms.u_mouse.value = mouse.divide(resolution)

      mat.uniformsNeedUpdate = true
    }

    { // Update mesh position
      const { x, y, z } = app.cam.position
      // TODO: Create method to set position to screen space
      mesh.position.set(x, y, z - 1.0)

      // TODO: Rearrange animate timing
      const { x: rx, y: ry, z: rz } = app.cam.rotation
      mesh.rotation.set(rx, ry, rz)
    }
  }
)

export default transitionLayerScene