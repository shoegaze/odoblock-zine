import { membraneGridString, membraneGridSelector, membraneGridCellString, membraneSelector } from "./stringTemplates"



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
]

const gridColumnCenter = gridArray[0].length / 2
const gridRowCenter = gridArray.length / 2

export const gridCellTransitionMultiplier = 3

export function insertMembraneGrid() {
  const membraneElement = document.querySelector(membraneSelector)
  if (membraneElement) {
    membraneElement.insertAdjacentHTML('afterbegin', membraneGridString)
  }
  const numberOfColumns = gridArray[0].length
  const numberOfRows = gridArray.length
  const numberOfCells = numberOfRows * numberOfColumns
  for (let i = 0; i < numberOfCells; i++) {
    const membraneGridElement: HTMLDivElement | null =
      document.querySelector(membraneGridSelector)
    if (membraneGridElement) {
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

}