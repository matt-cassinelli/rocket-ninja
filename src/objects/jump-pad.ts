export class JumpPad extends Phaser.Physics.Matter.Sprite {
  force = 17;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene.matter.world, object.x, object.y, 'jump-pad');
    scene.add.existing(this);
    this.setStatic(true);
    this.setSensor(true);
    this.setAngle(object.rotation);
    this.setDisplaySize(object.width, object.height);

    const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
    const fixedPos = Phaser.Math.RotateAround(
      center, object.x, object.y, Phaser.Math.DegToRad(object.rotation));
    this.setPosition(fixedPos.x, fixedPos.y);

    this.anims.create({
      key: 'trigger',
      frames: scene.anims.generateFrameNumbers('jump-pad', { start: 0, end: 13 }),
      frameRate: 12
    });
  }

  public trigger(): { x: number; y: number; } {
    if (this.anims.isPlaying) return;
    this.anims.play('trigger');
    this.scene.sound.play('jump-pad', { volume: 0.5 });

    const angle = Math.round(this.angle);
    const pointingDownish = [135, 180, 225].includes(angle);
    const pointingUpish = [-45, 315, 0, 45].includes(angle);
    const pointingRightish = [45, 90, 135].includes(angle);
    const pointingLeftish = [-45, 315, -90, 270, 225].includes(angle);
    const newVelX = pointingRightish ? this.force * 0.85
                  : pointingLeftish  ? this.force * 0.85 * -1
                  : 0;
    const newVelY = pointingDownish ? this.force * 0.5
                  : pointingUpish   ? this.force * 1.11 * -1
                  : 0;

    return { x: newVelX, y: newVelY };
  }
}
