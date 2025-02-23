export function randomItem(array: number[]) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/** Min and max included. */
export function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function clamp(value: number, min: number, max: number) {
  return value <= min ? min : value >= max ? max : value;
}

/** Returns a function which can be used to scale a value in one range to another range.
    For example, for an old range of 0..5 and a new range of 0..10, the input '1' becomes '2'.
    Negative and reversed ranges are supported. Min and max must not be the same. */
export function createRangeMapper(
  oldRange: { min: number; max: number; },
  newRange: { min: number; max: number; },
  clamp = true
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

  return (oldValue: number) => {
    if (clamp) {
      if (oldValue <= oldRange.min) return newRange.min;
      else if (oldValue >= oldRange.max) return newRange.max;
    }

    const ratio = (newMax - newMin) / (oldMax - oldMin);
    if (!oldRangeIsReversed && !newRangeIsReversed)
      return (oldValue - oldMin) * ratio + newMin;

    if (!oldRangeIsReversed && newRangeIsReversed)
      return newMax - ((oldValue - oldMin) * ratio + newMin);

    if (oldRangeIsReversed && newRangeIsReversed)
      return newMax - ((oldMax - oldValue) * ratio);

    if (oldRangeIsReversed && !newRangeIsReversed)
      return (oldMax - oldValue) * ratio + newMin;
  };
}
