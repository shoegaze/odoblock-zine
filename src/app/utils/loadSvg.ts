import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'


export const loadSvg = (group: THREE.Group, url: string): void => {
  // https://threejs.org/examples/webgl_loader_svg
  new SVGLoader().load(url, (data) => {
    data.paths.forEach((path, i) => {
      const userData = path.userData

      if (!userData) {
        console.error(`No user data found for path [${i}]`)
        return
      }

      const style = userData.style
      const { fill, fillOpacity, stroke, strokeOpacity } = style

      if (fill && fill !== 'none') {
        const color = new THREE.Color().setStyle(fill)

        const mat = new THREE.MeshBasicMaterial({
          color: color.convertSRGBToLinear(),
          opacity: fillOpacity,
          transparent: true,
          depthWrite: false
        })

        SVGLoader.createShapes(path).forEach((shape: THREE.Shape) => {
          const geo = new THREE.ShapeGeometry(shape)
          const mesh = new THREE.Mesh(geo, mat)

          group.add(mesh)
        })
      }

      if (stroke && stroke !== 'none') {
        const col = new THREE.Color().setStyle(stroke)
        const mat = new THREE.MeshBasicMaterial({
          color: col.convertSRGBToLinear(),
          opacity: strokeOpacity,
          transparent: true,
          depthWrite: false
        })

        path.subPaths.forEach((subPath, j) => {
          const points = subPath.getPoints()
          const geo = SVGLoader.pointsToStroke(points, style)

          if (geo) {
            const mesh = new THREE.Mesh(geo, mat)

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