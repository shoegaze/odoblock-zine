import { DoubleSide } from 'three'

const url = window.location.href

const onMembrane = /membrane/.test(url)

const containerElement = document.querySelector('#container')

const membraneLinkString = `<div class="membrane-link-container"><a href="./membrane.html">hehe</a></div>`

const membraneString = `
<div class="membrane">
  <div class="membrane-next">next</div>
  <div class="membrane-half-top"></div>
  <div class="membrane-half-bottom"></div>
</div>
`

const transitionTime = 350

export function addMembraneLink() {
  if (containerElement) {
    containerElement.insertAdjacentHTML('afterend', membraneLinkString)
  }
}

export function insertMembrane() {
  if (containerElement) {
    containerElement.insertAdjacentHTML('afterbegin', membraneString)
  }
}

function getMembraneHalves() {
  return [...document.querySelectorAll('[class^="membrane-half"]')]
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
    const membraneElement = document.querySelector('.membrane')
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
  const membraneElement = document.querySelector('.membrane')
  const halvesString = `
    <div class="membrane-half-top></div>
    <div class="membrane-half-bottom></div>
    `
  if (membraneElement) {
    membraneElement.insertAdjacentHTML('beforeend', halvesString)
  }
}

function setNewMembraneStyles(
  topHalf: HTMLDivElement,
  bottomHalf: HTMLDivElement
) {
  const translateDistance = randomNumberFromRange(160, 260)
  const topRotateDeg = randomNumberFromRange(280, 340)
  const bottomRotateDeg = randomNumberFromRange(280, 340)
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

const membraneNextElement = document.querySelector('.membrane-next')

if (membraneNextElement) {
  membraneNextElement.addEventListener('click', () => handleNext())
}

const membraneElement = document.querySelector('.membrane')

if (membraneElement) {
  membraneElement.addEventListener('mouseenter', () => {
    console.log('got hovered')

    const membraneHalves = [
      ...document.querySelectorAll("[class^='membrane-half']"),
    ]
    if (membraneHalves) {
      setNewMembraneStyles(
        membraneHalves[0] as HTMLDivElement,
        membraneHalves[1] as HTMLDivElement
      )
    }
  })
}
