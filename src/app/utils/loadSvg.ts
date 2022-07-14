import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'


export type LoadSvgOptions = {
  debug: boolean
}

export const loadSvg = (url: string, group: THREE.Group, options: LoadSvgOptions): void => {
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

      if (options.debug) {
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
          depthWrite: false
        })

        SVGLoader.createShapes(path).forEach((shape: THREE.Shape) => {
          const geo = new THREE.ShapeGeometry(shape)
          const mesh = new THREE.Mesh(geo, mat)

          if (options.debug) {
            console.log('Adding mesh', mesh)
          }

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

            if (options.debug) {
              console.log('adding mesh', mesh)
            }

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