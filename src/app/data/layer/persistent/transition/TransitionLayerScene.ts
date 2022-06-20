import * as THREE from "three"

import { AnimatedScene, createAnimatedScene } from "../../../../collection/scene/AnimatedScene"
import { App } from "../../../../App"
import { fadeDistance } from "../../../../collection/layer/Layer"


// TODO: Convert to just use THREE.Scene
const transitionLayerScene = createAnimatedScene(
  function setup(this) {
    // TODO: Calculate geo size based on screen size
    const geo = new THREE.PlaneGeometry(1.0, 1.0)
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        'u_t': { value: 0.0 },
        // Using brand color #ecd24a
        'u_color': { value: new THREE.Color(0.925, 0.824, 0.29) },
        'u_time': { value: 0.0 },
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
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        // https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p){
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
            mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
            mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
          return res*res;
        }

        void main() {
          vec2 uv = v_uv;

          if (u_t < 1.0e-6) {
            discard;
          }

          vec3 col = mix(
            vec3(0.0, 0.0, 0.0),
            u_color,
            u_t
          );

          vec2 st = uv - 0.5;
          col *= vec3(noise(st * u_t * 100.0 + u_time));
          // col = vec3(clamp(length(uv - u_mouse), 0.0, 1.0) < 0.5);

          if (col.r < 1.0-u_t) {
            discard;
          }

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

      const cam = app.getCamera()
      const layers = app.getLayers()

      // TODO: Use truncated triangle for u_t?
      const zCam = cam.position.z
      const zLayer = layers.getClosestLayer().zPos
      // https://graphtoy.com/?f1(x,t)=1%20-%20abs(%20(x%20-%204)/2%20)&v1=false&f2(x,t)=max(f1(x),%200)&v2=true&f3(x,t)=&v3=false&f4(x,t)=&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=1&coords=4.64315003434978,1.734851413907519,5.155202479020844
      const t = Math.max(0.0, 1.0 - Math.abs((zCam - zLayer) / fadeDistance))

      mat.uniforms.u_t.value = t
      // mat.uniforms.u_color.value = new THREE.Color(1.0, 0.0, 0.0)

      mat.uniforms.u_time.value = app.getSeconds()
      mat.uniforms.u_resolution.value = app.getRendererSize()

      // const mouse = app.getQueuedMousePosition()
      // mat.uniforms.u_mouse.value = mouse.divide(resolution)

      mat.uniformsNeedUpdate = true
    }

    { // Update mesh position
      const { position, rotation } = app.getCamera()
      const { x, y, z } = position
      // TODO: Create method to set position to screen space
      // TODO: Use camera normal for position
      mesh.position.set(x, y, z - 1.0)

      // TODO: Rearrange animate timing
      const { x: rx, y: ry, z: rz } = rotation
      mesh.rotation.set(rx, ry, rz)
    }
  }
)

export default transitionLayerScene