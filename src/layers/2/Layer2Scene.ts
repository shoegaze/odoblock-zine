import * as THREE from "three";
import { SVGLoader, SVGResult, SVGResultPaths } from "three/examples/jsm/loaders/SVGLoader"
import { AnimatedScene, createAnimatedScene } from "../../AnimatedScene";


const layer2Scene = createAnimatedScene(
  function setup(this: AnimatedScene, _) {
    const group = new THREE.Group()

    // Load SVG
    new SVGLoader().load(
      './svg/little-tree.svg',
      (data: SVGResult) => {
        data.paths.forEach((path: SVGResultPaths, i: number) => {
          const userData = path.userData

          if (!userData) {
            console.error(`No user data found for path [${i}]`)
            return
          }

          const style = userData.style
          const { fill: fillColor, fillOpacity, stroke: strokeColor, strokeOpacity } = style

          { // DEBUG:
            console.group(`Path: [${i}]`)
            console.log('path', path)
            console.log('style', style)
            console.log('fillColor', fillColor)
            console.log('fillOpacity', fillOpacity)
            console.log('strokeColor', strokeColor)
            console.log('strokeOpacity', strokeOpacity)
            console.groupEnd()
          }

          if (fillColor && fillColor !== 'none') {
            const color = new THREE.Color().setStyle(fillColor)

            const mat = new THREE.MeshBasicMaterial({
              color: color.convertSRGBToLinear(),
              opacity: fillOpacity,
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: true
            })

            SVGLoader.createShapes(path).forEach((shape: THREE.Shape) => {
              const geo = new THREE.ShapeGeometry(shape)
              const mesh = new THREE.Mesh(geo, mat)

              group.add(mesh)
            })
          }

          if (strokeColor && strokeColor !== 'none') {
            const col = new THREE.Color().setStyle(strokeColor)
            const mat = new THREE.MeshBasicMaterial({
              color: col.convertSRGBToLinear(),
              opacity: strokeOpacity,
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false
            })

            // TODO
            for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
              const subPath = path.subPaths[j]
              const points = subPath.getPoints()

              const geo = SVGLoader.pointsToStroke(points, style)

              if (geo) {
                const mesh = new THREE.Mesh(geo, mat)
                group.add(mesh)
              }
            }
          }
        })

        group.position.z = +10.0
        this.scene.add(group)
      }
    )
  },

  function animate(this: AnimatedScene, _) { }
)

export default layer2Scene