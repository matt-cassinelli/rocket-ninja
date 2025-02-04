export function getCustomProperty<Type>(from: Phaser.Types.Tilemaps.TiledObject, name: string): Type {
  return from.properties
    .find((x: { name: string, type: string, value: number | string | boolean }) => x.name === name)?.value;
}
