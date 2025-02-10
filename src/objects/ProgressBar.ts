export class ProgressBar {
  private scene: Phaser.Scene;
  private bar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private padding: number;
  private height: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.x = 0 + this.padding;
    this.y = (scene.scale.height / 2) - (this.height / 2);
    this.padding = scene.scale.width / 6;
    this.height = scene.scale.height / 21;
    this.bar = this.scene.add.graphics();

    // this.scene.add.graphics()
    //   .fillRect(this.x, this.y, (this.scene.scale.width - this.padding * 2), this.height)
    //   .fillStyle(0x000000, 1);
  }

  // Value is from 0..1
  progress(value: number) {
    this.bar.clear();
    this.bar.fillStyle(0x15cc1a, 1);
    const width = (this.scene.scale.width - this.padding * 2) * value;
    this.bar.fillRect(this.x, this.y, width, this.height);
  }

  complete() {
    this.bar.destroy();
  }
}
