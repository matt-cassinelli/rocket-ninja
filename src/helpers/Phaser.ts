export function getCustomProperty<Type>(from: Phaser.Types.Tilemaps.TiledObject, name: string): Type {
  return from.properties
    .find((x: { name: string, type: string, value: number | string | boolean }) => x.name === name)?.value;
}

export function getMaxDuration(keys: Phaser.Input.Keyboard.Key[]) {
  return Math.max(...keys.map(k => k.getDuration()));
}
