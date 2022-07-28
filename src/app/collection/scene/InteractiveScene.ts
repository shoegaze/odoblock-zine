import * as THREE from "three"

import { App } from "../../App"
import { AppScene, genericSetActive } from "./AppScene"


interface InputTypeEnum<V> {
  type: 'mouseclick' | 'mousemove' | 'keydown' | 'keyup'
  value: V
}

// type InputTypeMouseValue = THREE.Vector2
// export interface InputTypeMouse extends InputTypeEnum<InputTypeMouseValue> {
//   type: 'mousemove'
//   value: InputTypeMouseValue
// }

// type InputTypeKeyValue = string
// export interface InputTypeKey extends InputTypeEnum<InputTypeKeyValue> {
//   type: 'key'
//   value: InputTypeKeyValue
// }

export enum SceneInputType {
  InputTypeMouse,
  InputTypeKey
}


type OnInput = (this: InteractiveScene, app: App, input: SceneInputType) => void
export interface InteractiveScene extends AppScene {
  focused: boolean
  onInput: OnInput
}


type InteractiveSceneCallback = (this: InteractiveScene, app: App) => void
type CreateInteractiveScene = (
  this: InteractiveScene,
  setup: InteractiveSceneCallback,
  onInput: OnInput
) => InteractiveScene

export const createInteractiveScene: CreateInteractiveScene = (setup, onInput) => ({
  focused: false,
  onInput,


  scene: new THREE.Scene(),
  setup: setup as (this: AppScene, app: App) => void,

  setActive(this, active) {
    genericSetActive(this, active)
  }
})