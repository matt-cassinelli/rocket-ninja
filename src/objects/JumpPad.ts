import { Player } from './Player';

export class JumpPad extends Phaser.Physics.Arcade.Sprite {
  force = 560;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'jump-pad');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.anims.create({
      key: 'trigger',
      frames: scene.anims.generateFrameNumbers('jump-pad', { start: 0, end: 9 }),
      frameRate: 10
    });

    this.setDisplaySize(object.width, object.height);
    this.setOrigin(0, 0);
    this.setAngle(object.rotation);

    // Disgusting hack to fake rotation of the physics body (they can't be rotated).
    switch (this.angle) {
      case 0: {
        this.setBodySize(object.width, object.height);
        this.setOffset(object.height / 2, object.height / 2);
        break;
      }
      case 90: {
        this.setBodySize(object.height, object.width);
        this.setOffset(-object.height / 2, object.height / 2);
        break;
      }
      case 180:
      case -180: {
        this.setBodySize(object.width, object.height);
        this.setOffset(-24, -object.height / 2);
        break;
      }
      case 270:
      case -90: {
        this.setBodySize(object.height, object.width);
        this.setOffset(object.height / 2, -24);
        break;
      }
    }
  }

  public trigger(player: Player): void {
    this.anims.play('trigger', false);
    const rotatedVelocity = this.scene.physics.velocityFromRotation(this.rotation, this.force);
    player.setVelocity(rotatedVelocity.y, -rotatedVelocity.x);
  }
}
