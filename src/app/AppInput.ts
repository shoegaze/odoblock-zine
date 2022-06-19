import * as THREE from "three"
import { Vector2 } from "three"


export enum AppInputType {
  Translation,
  Zoom
}

type AppInputTimes = {
  [key in AppInputType]: number
}

type AppInputsQueueType = number | THREE.Vector2
type AppInputsQueue = {
  [key in AppInputType]: AppInputsQueueType
}

export interface AppInput {
  readonly clock: THREE.Clock,

  receiveInput(this: AppInput, inputType: AppInputType, amount: AppInputsQueueType): void
  getQueuedInput(this: AppInput, inputType: AppInputType): AppInputsQueueType
  resetQueuedInputs(this: AppInput): void
  getLastInputTime(this: AppInput, inputType?: AppInputType): number
}

export const createAppInput = (clock: THREE.Clock): AppInput => {
  // TODO:
  const lastInputTimes: AppInputTimes = {
    [AppInputType.Translation]: 0.0,
    [AppInputType.Zoom]: 0.0
  }

  const inputsQueue: AppInputsQueue = {
    [AppInputType.Translation]: new THREE.Vector2(),
    [AppInputType.Zoom]: 0.0
  }

  return {
    clock,

    receiveInput(this: AppInput, inputType: AppInputType, arg: AppInputsQueueType): void {
      lastInputTimes[inputType] = this.clock.getElapsedTime()

      if (inputType === AppInputType.Translation) {
        if (typeof arg === 'number' || !arg.isVector2) {
          console.error('Expected argument of type `THREE.Vector2` for translation input')
          return
        }

        const { x: dx, y: dy } = arg
        const translationQueue = inputsQueue[AppInputType.Translation] as THREE.Vector2

        translationQueue.set(dx, dy)
      }
      else if (inputType === AppInputType.Zoom) {
        if (typeof arg !== 'number') {
          console.error('Expected argument of type `number` for zoom input')
          return
        }

        const dz = arg
        inputsQueue[AppInputType.Zoom] = dz
      }
    },

    getQueuedInput(this: AppInput, inputType: AppInputType): AppInputsQueueType {
      return inputsQueue[inputType]
    },

    resetQueuedInputs(this: AppInput) {
      (inputsQueue[AppInputType.Translation] as Vector2).set(0.0, 0.0)
      inputsQueue[AppInputType.Zoom] = 0.0
    },

    // With no inputType, returns the time since any last input was received
    getLastInputTime(this: AppInput, inputType?: AppInputType): number {
      if (inputType === undefined) {
        const lastInput = Object.values(lastInputTimes)
          .reduce((acc, t) => Math.max(acc, t), 0.0)

        return this.clock.getElapsedTime() - lastInput
      }

      return this.clock.getElapsedTime() - lastInputTimes[inputType]
    }
  }
}