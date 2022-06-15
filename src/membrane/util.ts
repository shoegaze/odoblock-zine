export function randomNumberFromRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function pickRandomTrueFalse() {
  return Math.floor(Math.random() * 100) % 2
}
