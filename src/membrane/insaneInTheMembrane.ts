import {
  membraneString,
  membraneHalvesString,
  membraneLinkString,
  membraneGridString,
  membraneGridCellString,
  containerSelector,
  membraneHalfSelector,
  membraneNextSelector,
  membraneSelector,
  membraneGridSelector,
} from './stringTemplates'

const url = window.location.href
const onMembrane = /membrane/.test(url)
const containerElement = document.querySelector(containerSelector)

const transitionTime = 350

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

export function insertMembraneLink() {
  if (containerElement) {
    containerElement.insertAdjacentHTML('afterend', membraneLinkString)
  }
}

function insertMembrane() {
  if (containerElement) {
    containerElement.insertAdjacentHTML('afterbegin', membraneString)
  }
}

function insertMembraneGrid() {
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

function getMembraneHalves() {
  return [
    ...document.querySelectorAll(membraneHalfSelector),
  ] as HTMLDivElement[]
}

function handleNext() {
  console.log('clicked next')
  const membraneHalves = getMembraneHalves()
  if (membraneHalves) {
    membraneHalves.forEach((half) => {
      half.classList.add('exit')
      setTimeout(() => {
        half.remove()
      }, transitionTime)
    })
    const membraneElement = document.querySelector(membraneSelector)
    if (membraneElement) {
      membraneElement.classList.add('--timeout')
    }
    setTimeout(() => {
      insertNextMembrane()
    }, transitionTime)
    setTimeout(() => {
      if (membraneElement) {
        membraneElement.classList.remove('--timeout')
      }
    }, transitionTime * 2)
  }
}

function insertNextMembrane() {
  const membraneElement = document.querySelector(membraneSelector)
  if (membraneElement) {
    membraneElement.insertAdjacentHTML('beforeend', membraneHalvesString)
  }
}

function setNewMembraneStyles(
  topHalf: HTMLDivElement,
  bottomHalf: HTMLDivElement
) {
  // default translate range 160, 260
  // default def range 280, 240
  const translateDistance = randomNumberFromRange(120, 280)
  const topRotateDeg = randomNumberFromRange(20, 340)
  const bottomRotateDeg = randomNumberFromRange(20, 340)
  const topTransform = `translate(-${translateDistance}px, -${
    translateDistance / 2
  }px) rotate(${topRotateDeg}deg)`
  const topBgColor = 'black'
  const bottomTransform = `translate(${translateDistance}px, ${
    translateDistance / 2
  }px) rotate(${bottomRotateDeg}deg)`
  const bottomBgColor = 'white'
  topHalf.style.transform = topTransform
  topHalf.style.backgroundColor = topBgColor
  bottomHalf.style.transform = bottomTransform
  bottomHalf.style.backgroundColor = bottomBgColor
}

function randomNumberFromRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

onMembrane && insertMembrane()

const membraneNextElement: HTMLDivElement | null =
  document.querySelector(membraneNextSelector)

if (membraneNextElement) {
  membraneNextElement.addEventListener('click', () => handleNext())
}

const membraneElement: HTMLDivElement | null =
  document.querySelector(membraneSelector)

insertMembraneGrid()

if (membraneElement) {
  membraneElement.addEventListener('mouseenter', () => {
    const membraneHalves = getMembraneHalves()
    console.log('got hovered')
    if (membraneHalves) {
      setNewMembraneStyles(membraneHalves[0], membraneHalves[1])
    }
    if (membraneNextElement) {
      membraneNextElement.style.zIndex = '900'
    }
  })

  membraneElement.addEventListener('mouseleave', () => {
    const membraneHalves = getMembraneHalves()
    console.log('mouseleave')
    membraneHalves.forEach((half) => {
      half.style.transform = ''
    })
    if (membraneNextElement) {
      membraneNextElement.style.zIndex = '700'
    }
  })
}
