import {
  membraneGridString,
  membraneGridSelector,
  membraneGridCellString,
  membraneGridCellSelector,
  membraneSelector,
} from './stringTemplates'

import { randomNumberFromRange, pickRandomTrueFalse } from './util'

const gridArray = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

const numberOfColumns = gridArray[0].length
const numberOfRows = gridArray.length
const numberOfCells = numberOfRows * numberOfColumns

const gridColumnCenter = Math.floor(gridArray[0].length / 2)
const gridRowCenter = Math.floor(gridArray.length / 2)

// export const gridCellTransitionMultiplier = 15

export function insertMembraneGrid(differentiator: string) {
  const membraneElement = document.querySelector(membraneSelector)
  if (membraneElement) {
    membraneElement.insertAdjacentHTML('afterbegin', membraneGridString)
  }

  for (let i = 0; i < numberOfCells; i++) {
    const membraneGridElement: HTMLDivElement | null =
      document.querySelector(membraneGridSelector)
    if (membraneGridElement) {
      membraneGridElement.classList.add(differentiator)
      membraneGridElement.style.gridTemplateRows = `repeat(${numberOfRows}, 20px)`
      membraneGridElement.style.gridTemplateColumns = `repeat(${numberOfColumns}, 1fr)`

      membraneGridElement.insertAdjacentHTML(
        'beforeend',
        membraneGridCellString
      )
    }
  }
}

export function findColumnRowAbsolute() {
  const allCells = [
    ...document.querySelectorAll<HTMLDivElement>(membraneGridCellSelector),
  ]
  if (allCells.length) {
    allCells.forEach((cell) => {})
  }
}

type Mode = 'grow' | 'twist'

export function makeCellTransforms(multiplier: number, mode: Mode) {
  const allTransforms: string[] = []
  // find y absolute
  const yAbsolutes = gridArray.map((col, i) => {
    const distance = Math.abs(i + 1 - gridColumnCenter) * multiplier
    const position = i + 1 < gridColumnCenter ? '-' : ''
    const transformString = `${position}${distance}`
    return transformString
  })
  console.log('yAbsolutes:', yAbsolutes)
  //// find x absolute
  const xAbsolutes = gridArray[0].map((row, i) => {
    console.log(gridRowCenter)
    const distance = Math.abs(i - 1 - gridRowCenter) * multiplier
    const position = i - 1 < gridRowCenter ? '-' : ''
    const transformString = `${position}${distance}`
    return transformString
  })
  console.log('xAbsolutes:', xAbsolutes)

  gridArray.forEach((col, i) => {
    const yAbsolute = yAbsolutes[i]
    col.forEach((row, n) => {
      const xAbsolute = xAbsolutes[n]
      if (mode === 'twist') {
        const transformString = `translate(${yAbsolute}px, ${xAbsolute}px)`
        allTransforms.push(transformString)
      }
      if (mode === 'grow') {
        const transformString = `translate(${xAbsolute}px, ${yAbsolute}px)`
        allTransforms.push(transformString)
      }
    })
  })

  console.log(allTransforms)

  // allCells.forEach((cell, i) => {
  //   console.log(cell)
  //   console.log(allTransforms[i])
  //   cell.style.transform = allTransforms[i]
  // })
  return allTransforms
}
