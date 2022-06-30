import * as THREE from "three"
import { SVGLoader, SVGResult, SVGResultPaths } from "three/examples/jsm/loaders/SVGLoader"

import { createLocalLayer } from "../../../../collection/layer/Layer"
import { createStaticScene } from "../../../../collection/scene/StaticScene"


const testSvg = createLocalLayer(0, [
  createStaticScene(
    function setup(this) {
      const group = new THREE.Group()

      { // Load svg meshes
        new SVGLoader().load(
          'svg/little-tree.svg',
          (data) => {
            data.paths.forEach((path, i) => {
              const userData = path.userData

              if (!userData) {
                console.error(`No user data found for path [${i}]`)
                return
              }

              const style = userData.style
              const { fill, fillOpacity, stroke, strokeOpacity } = style


              { // DEBUG:
                console.group(`Path: [${i}]`)
                console.log('path', path)
                console.log('style', style)
                console.log('fillColor', fill)
                console.log('fillOpacity', fillOpacity)
                console.log('strokeColor', stroke)
                console.log('strokeOpacity', strokeOpacity)
                console.groupEnd()
              }


              if (fill && fill !== 'none') {
                const color = new THREE.Color().setStyle(fill)

                const mat = new THREE.MeshBasicMaterial({
                  color: color.convertSRGBToLinear(),
                  opacity: fillOpacity,
                  transparent: true,
                  side: THREE.DoubleSide,
                  depthWrite: false
                })

                SVGLoader.createShapes(path).forEach((shape: THREE.Shape) => {
                  const geo = new THREE.ShapeGeometry(shape)
                  const mesh = new THREE.Mesh(geo, mat)

                  console.log('Adding mesh', mesh)

                  group.add(mesh)
                })
              }

              if (stroke && stroke !== 'none') {
                const col = new THREE.Color().setStyle(stroke)
                const mat = new THREE.MeshBasicMaterial({
                  color: col.convertSRGBToLinear(),
                  opacity: strokeOpacity,
                  transparent: true,
                  side: THREE.DoubleSide,
                  depthWrite: false
                })

                path.subPaths.forEach((subPath, j) => {
                  const points = subPath.getPoints()
                  const geo = SVGLoader.pointsToStroke(points, style)

                  if (geo) {
                    const mesh = new THREE.Mesh(geo, mat)

                    console.log('adding mesh', mesh)

                    group.add(mesh)
                  }
                  else {
                    console.error(`No geometry found for path [${i}] in sub-path [${j}]`)
                  }
                })
              }
            })
          }
        )
      }

      group.position.z = +10.0
      this.scene.add(group)
    }
  )
])

export default testSvg