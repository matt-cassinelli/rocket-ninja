export class Key extends Phaser.GameObjects.Image {
  public readonly forDoor: integer;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'key');
    console.log('Creating Key with properties:');
    console.log(object.properties);
    // TODO: Is there a cleaner way to get property?
    this.forDoor = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'ForDoor')?.value;
    this.setDisplaySize(28, 28);
    scene.add.existing(this);
  }

  public pickUp(): void {
    
  }
}
