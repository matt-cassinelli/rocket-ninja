import { Player } from './Player';

export class JumpPad extends Phaser.Physics.Arcade.Sprite {
  force = 550;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'jump-pad');

    this.anims.create({
      key: 'trigger',
      frames: scene.anims.generateFrameNumbers('jump-pad', { start: 0, end: 9 }),
      frameRate: 10
    });

    this.rotation = Phaser.Math.DegToRad(object.rotation);
    this.setDisplaySize(28, 28); // Scale to fit 1 tile.
    scene.add.existing(this);
  }

  public trigger(player: Player): void {
    this.anims.play('trigger', false);
    const rotatedVelocity = this.scene.physics.velocityFromRotation(this.rotation, this.force);
    player.setVelocity(rotatedVelocity.y, -rotatedVelocity.x);
  }
}
