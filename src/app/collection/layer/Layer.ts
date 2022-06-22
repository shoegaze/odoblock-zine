import { AppScene } from "../scene/AppScene"


export const fadeDistance = 125.0
export const layersDistance = 300.0

export interface Layer {
  zId: number
  zPos: number
  scenes: Array<AppScene>

  setActive(this: Layer, active: boolean): void
}

export const zIdToZPos = (id: number): number => -id * layersDistance
// https://graphtoy.com/?f1(x,t)=4&v1=false&f2(x,t)=abs(min(0.0,floor(x/f1(x))))&v2=true&f3(x,t)=f2(-x)%20*%20f1(x)&v3=true&f4(x,t)=&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=1&coords=-9.186638050037578,11.132397938736545,41.42725457271732
export const zPosToZid = (zPos: number): number => Math.abs(Math.min(0, Math.floor(zPos / layersDistance)))

let idLayer = 0
export const createLocalLayer = (...scenes: AppScene[]): Layer => ({
  zId: idLayer++,
  zPos: zIdToZPos(idLayer - 1),
  scenes,

  setActive(active: boolean) {
    this.scenes.forEach((as: AppScene) => {
      as.setActive(active)
    })
  }
})

let idPersistent = 0
export const createPersistentLayer = (...scenes: AppScene[]): Layer => ({
  zId: idPersistent++,
  zPos: 0.0,
  scenes,

  // TODO: Refactor this (DRY)
  setActive(active: boolean) {
    this.scenes.forEach((as: AppScene) => {
      as.setActive(active)
    })
  }
})