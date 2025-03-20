export class Spike extends Phaser.Physics.Matter.Image {
  damage = 500;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene.matter.world, object.x, object.y, 'spike');

    this.setStatic(true);
    this.setAngle(object.rotation);
    this.setDisplaySize(object.width, object.height);

    const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
    const fixedPos = Phaser.Math.RotateAround(
      center, object.x, object.y, Phaser.Math.DegToRad(object.rotation));
    this.setPosition(fixedPos.x, fixedPos.y);

    scene.add.existing(this);
  }
}
