export class ProgressBar extends Phaser.GameObjects.Graphics {
  private padding: number;
  private height: number;
  private roundness = 15;

  constructor(scene: Phaser.Scene) {
    super(scene, { fillStyle: { color: 0x15cc1a, alpha: 1 } });
    this.padding = scene.scale.width / 6;
    this.height = scene.scale.height / 21;
    this.displayOriginX = 0 + this.padding;
    this.displayOriginY = (scene.scale.height / 2) - (this.height / 2);
    scene.add.existing(this);
  }

  // Value is from 0..1
  progress(value: number) {
    this.clear();
    const width = (this.scene.scale.width - this.padding * 2) * value;
    this.fillRoundedRect(this.displayOriginX, this.displayOriginY, width, this.height, this.roundness);
  }

  complete() {
    this.destroy();
  }
}
