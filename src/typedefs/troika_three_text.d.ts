declare module 'troika-three-text' {
  // TODO
  export class Text extends THREE.Object3D<THREE.Event> {
    text: string
    font: string
    fontSize: number
    color: number | THREE.Color
    // TODO: 'xx%'
    anchorX: 'left' | 'center' | 'right'
    anchorY: 'top' | 'top-baseline' | 'middle' | 'bottom' | 'bottom-baseline'
    textAlign: 'left' | 'center' | 'right' | 'justify'
    clipRect: [number, number, number, number]
    maxWidth: number
    strokeWidth: number
    outlineColor: number | THREE.Color
    outlineOffsetX: number
    outlineOffsetY: number
    outlineWidth: number

    sync(this: Text): void
  }
}