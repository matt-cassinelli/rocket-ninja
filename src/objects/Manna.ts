export class Manna extends Phaser.Physics.Arcade.Sprite {
  worth = 5;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'manna');

    this.anims.create({
      key: 'rotate',
      frames: this.anims.generateFrameNumbers('manna', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.play('rotate', true);
    this.setScale(1.5);
    scene.add.existing(this);
  }

  // [idea]
  // collect() {
  // this.disableBody(true, true)
  // this.setActive(false);
  // this.visible = false;
  // this.destroy()
  // }
}
