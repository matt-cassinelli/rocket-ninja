export class Spike extends Phaser.Physics.Arcade.Image {
  damage = 500;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'spike');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setDisplayOrigin(0, 0);
    this.setDisplaySize(object.width, object.height);
    this.setAngle(object.rotation);

    // This is a hack to fake rotation of the physics body.
    // Arcade Physics does not allow rotation of physics bodies, it only allows rotating the rendered image.
    // Maybe we should migrate to Matter Physics.
    switch (this.angle) {
      case 0: {
        this.setBodySize(object.width, object.height);
        this.setOffset(object.width, object.height);
        break;
      }
      case 90: {
        this.setBodySize(object.height, object.width);
        this.setOffset(object.height, object.height);
        break;
      }
      case 180:
      case -180: {
        this.setBodySize(object.width, object.height);
        break;
      }
      case 270:
      case -90: {
        this.setBodySize(object.height, object.width);
        this.setOffset(object.width, -object.height);
        break;
      }
    }
  }
}
