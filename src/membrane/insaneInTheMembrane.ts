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
  membraneGridCellSelector,
  highBoxShadowString,
  lowBoxShadowString,
} from './stringTemplates'

import { insertMembraneGrid, makeCellTransforms } from './membraneGrid'

import { randomNumberFromRange, pickRandomTrueFalse } from './util'

const url = window.location.href
const onMembrane = /membrane/.test(url)
const containerElement = document.querySelector(containerSelector)

const transitionTime = 350

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
  const scaleUp = randomNumberFromRange(115, 150) / 100
  const scaleDown = randomNumberFromRange(55, 95) / 100
  const randomTrueFalse = pickRandomTrueFalse()

  const topTransform = `translate(-${translateDistance}px, -${
    translateDistance / 2
  }px) scale(${
    randomTrueFalse ? scaleUp : scaleDown
  }) rotate(${topRotateDeg}deg)`
  const topBgColor = 'black'
  const bottomTransform = `translate(${translateDistance}px, ${
    translateDistance / 2
  }px) scale(${
    !randomTrueFalse ? scaleUp : scaleDown
  }) rotate(${bottomRotateDeg}deg`
  const bottomBgColor = 'white'
  topHalf.style.transform = topTransform
  topHalf.style.backgroundColor = topBgColor
  topHalf.style.boxShadow = randomTrueFalse
    ? highBoxShadowString
    : lowBoxShadowString
  bottomHalf.style.transform = bottomTransform
  bottomHalf.style.backgroundColor = bottomBgColor
  bottomHalf.style.boxShadow = !randomTrueFalse
    ? highBoxShadowString
    : lowBoxShadowString
}

onMembrane && insertMembrane()

const membraneNextElement: HTMLDivElement | null =
  document.querySelector(membraneNextSelector)

if (membraneNextElement) {
  membraneNextElement.addEventListener('click', () => handleNext())
}

const membraneElement: HTMLDivElement | null =
  document.querySelector(membraneSelector)

membraneElement && insertMembraneGrid()

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
    // TESTING remove later
    const allCells = [
      ...document.querySelectorAll<HTMLDivElement>(membraneGridCellSelector),
    ]

    if (allCells.length) {
      // TODO: use Math.abs() to find the difference from the center
      // of the current array row and col to calculate translate value
      // allCells.forEach(
      //   (cell) => (cell.style.transform = 'translate(-20px, -15px)')
      // )
      const multiplier = randomNumberFromRange(15, 125)
      const allTransforms = makeCellTransforms(multiplier)
      allCells.forEach((cell, i) => {
        cell.style.transform = allTransforms[i]
      })
    }
  })

  membraneElement.addEventListener('mouseleave', () => {
    const membraneHalves = getMembraneHalves()
    console.log('mouseleave')
    membraneHalves.forEach((half) => {
      half.style.transform = ''
      half.style.boxShadow = ''
    })
    if (membraneNextElement) {
      membraneNextElement.style.zIndex = '700'
    }
    // TESTING remove later
    const allCells = [
      ...document.querySelectorAll<HTMLDivElement>(membraneGridCellSelector),
    ]

    if (allCells.length) {
      // TODO: use Math.abs() to find the difference from the center
      // of the current array row and col to calculate translate value
      allCells.forEach((cell) => (cell.style.transform = ''))
    }
  })
}
