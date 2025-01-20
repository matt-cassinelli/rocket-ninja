export class Manna extends Phaser.GameObjects.Image {
  readonly value: integer; // Ranges from 1-10

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'manna');
    // [old] this.scene = scene;
    scene.add.existing(this);

    this.value = Math.round(
      (Math.random() * 9) + 1
    );

    this.setScale(0.1 + (this.value * 0.09));
  }

  // [idea]
  // collect() {
  // this.disableBody(true, true)
  // this.setActive(false);
  // this.visible = false;
  // this.destroy()
  // }
}
