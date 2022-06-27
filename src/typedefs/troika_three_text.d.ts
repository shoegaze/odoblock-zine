declare module 'troika-three-text' {
  // TODO
  export class Text extends THREE.Mesh {
    text: string
    // TODO: 'xx%'
    anchorX: number | 'left' | 'center' | 'right'
    // TODO: 'xx%'
    anchorY: number | 'top' | 'top-baseline' | 'top-cap' | 'top-ex' | 'middle' | 'bottom' | 'bottom-baseline'
    curveRadius: number
    direction: 'auto' | 'ltr' | 'rtl'
    font: string | null
    fontSize: number
    letterSpacing: number
    lineHeight: number | 'normal'
    maxWidth: number
    overflowWrap: 'normal' | 'break-word'
    textAlign: 'left' | 'center' | 'right' | 'justify'
    textIndent: number
    whiteSpace: 'normal' | 'nowrap'

    // material: THREE.Material | null
    color: string | number | THREE.Color
    colorRanges: object | null
    outlineWidth: number | string
    outlineColor: string | number | THREE.Color
    outlineBlur: number | string
    outlineOffsetX: number | string
    outlineOffsetY: number | string
    strokeWidth: number | string
    strokeColor: string | number | THREE.Color
    strokeOpacity: number
    fillOpacity: number
    depthOffset: number
    clipRect: [number, number, number, number]
    orientation: string
    glyphGeometryDetail: number
    sdfGlyphSize: number | null
    gpuAccelerateSDF: boolean
    debugSDF: boolean

    sync(this: Text, callback?: () => void): void
    // onBeforeRender: (this: Text, renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, geometry: THREE.GEome, material: THREE.Material, group: THREE.Group) => void
    // onAfterRender: (this: Text, /* ... */)
    dispose(this: Text): void

    // raycast(this: Text, raycaster: THREE.Raycaster, intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]): void;
  }
}