export function getCustomProperty<Type>(from: Phaser.Types.Tilemaps.TiledObject, name: string): Type {
  return from.properties
    .find((x: { name: string, type: string, value: number | string | boolean }) => x.name === name)?.value;
}

export function randomItem(array: number[]) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function randomInRange(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
