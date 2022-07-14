import { AppScene } from "../scene/AppScene"


export const fadeDistance = 50.0
export const layersDistance = 150.0

export type ZID = number
export type ZPos = number

export interface Layer {
  zId: ZID
  zPos: ZPos
  scenes: Array<AppScene>

  setActive(this: Layer, active: boolean): void
}

export const zIdToZPos = (id: ZID): ZPos => -id * layersDistance
// https://graphtoy.com/?f1(x,t)=4&v1=false&f2(x,t)=abs(min(0.0,floor(x/f1(x))))&v2=true&f3(x,t)=f2(-x)%20*%20f1(x)&v3=true&f4(x,t)=&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=1&coords=-9.186638050037578,11.132397938736545,41.42725457271732
export const zPosToZid = (zPos: ZPos): ZID => Math.abs(Math.min(0, Math.floor(zPos / layersDistance)))

export const createLocalLayer = (zId: ZID, scenes: AppScene[]): Layer => ({
  zId,
  zPos: zIdToZPos(zId),
  scenes,

  setActive(active: boolean) {
    this.scenes.forEach((as: AppScene) => {
      as.setActive(active)
    })
  }
})

export const createPersistentLayer = (scenes: AppScene[]): Layer => ({
  zId: 0,
  zPos: 0.0,
  scenes,

  // TODO: Refactor this (DRY)
  setActive(active: boolean) {
    this.scenes.forEach((as: AppScene) => {
      as.setActive(active)
    })
  }
})