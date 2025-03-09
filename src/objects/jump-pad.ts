import { Player } from './player';

export class JumpPad extends Phaser.Physics.Arcade.Sprite {
  force = 770;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'jump-pad');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0, 0);
    this.setAngle(object.rotation);
    this.setSize(object.width, object.height);
    this.setDisplaySize(object.width, object.height);
    const offset = Phaser.Math.RotateAround(
      { x: 0, y: 0 },
      object.width / 2,
      object.height,
      this.rotation);
    this.body.setOffset(-offset.x + object.width * 0.25, -offset.y + object.height * 0.75);
    this.body.setCircle(object.width / 2);

    this.anims.create({
      key: 'trigger',
      frames: scene.anims.generateFrameNumbers('jump-pad', { start: 0, end: 9 }),
      frameRate: 12
    });
  }

  public trigger(player: Player) {
    if (this.anims.isPlaying) {
      return;
    }
    const angle = Math.round(this.angle);
    const velX = [45, 90, 135].includes(angle) ? this.force
      : [-45, 315, -90, 270, 225].includes(angle) ? this.force * -1
      : 0;
    const velY = [135, 180, 225].includes(angle) ? this.force
      : [-45, 315, 0, 45].includes(angle) ? this.force * -1
      : 0;

    player.hitJumpPad(velX, velY);
    this.anims.play('trigger');
    this.scene.sound.play('jump-pad', { volume: 0.5 });
  }
}
