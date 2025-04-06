export function prettyPrint(num: number, digits = 2) {
  const prettyZero = `0.${'0'.repeat(digits)}`;
  return num.toFixed(digits).replace(`-${prettyZero}`, prettyZero);
}
