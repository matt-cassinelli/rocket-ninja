export function getCustomProperty<Type>(from: Phaser.Types.Tilemaps.TiledObject, name: string): Type {
  return from.properties
    .find((x: { name: string, type: string, value: number | string | boolean }) => x.name === name)?.value;
}

export function randomItem(array: number[]) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

// Min and max included.
export function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function clamp(value: number, min: number, max: number) {
  return value <= min ? min : value >= max ? max : value;
}

// This function returns a function which can be used to map a value in one range to another range.
// For example, for an old range of 0..5 and a new range of 0..10, the input '1' would become '2'.
// Negative and reversed ranges are supported. Min and max must not be the same.
export function createRangeMapper(
  oldRange: { min: number; max: number; },
  newRange: { min: number; max: number; }
) {
  let oldRangeIsReversed = false;
  const oldMin = Math.min(oldRange.min, oldRange.max);
  const oldMax = Math.max(oldRange.min, oldRange.max);
  if (oldMin != oldRange.min)
    oldRangeIsReversed = true;

  let newRangeIsReversed = false;
  const newMin = Math.min(newRange.min, newRange.max);
  const newMax = Math.max(newRange.min, newRange.max);
  if (newMin != newRange.min)
    newRangeIsReversed = true;

  if (!oldRangeIsReversed && !newRangeIsReversed) {
    return (valueToScale: number) => {
      return (valueToScale - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
    };
  }

  return (valueToScale: number) => {
    let portion: number;
    if (oldRangeIsReversed)
      portion = (oldMax - valueToScale) * (newMax - newMin) / (oldMax - oldMin);
    else
      portion = (valueToScale - oldMin) * (newMax - newMin) / (oldMax - oldMin);

    if (newRangeIsReversed)
      return newMax - portion;
    else
      return portion + newMin;
  };
}
