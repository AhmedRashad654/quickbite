export function fromMinor(minor: number): number {
  return minor / 100;
}

export function sumMinor(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

export function multiplyMinor(unitPriceMinor: number, quantity: number): number {
  return unitPriceMinor * quantity;
}
