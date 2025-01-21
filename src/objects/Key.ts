export class Key extends Phaser.GameObjects.Image {
  public readonly forDoor: integer;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'key');
    // TODO: Is there a cleaner way to get property?
    this.forDoor = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'ForDoor')?.value;
    this.setDisplaySize(28, 28);

    const hoverIntensity = 4;
    scene.tweens.add({
      targets: this,
      y: this.y - hoverIntensity,
      duration: Phaser.Math.Between(950, 1300),
      delay: Phaser.Math.Between(0, 500),
      ease: 'Sine.easeInOut',
      yoyo: true,
      loop: -1
    });

    scene.add.existing(this);
  }

  public pickUp(): void {
    //
  }
}
