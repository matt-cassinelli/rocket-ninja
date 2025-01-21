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
