export class HealthBar {
  bar: Phaser.GameObjects.Graphics;
  width: number;
  maxHealth = 200;
  ratio: number;
  centerX: number;
  height = 32;

  constructor(scene: Phaser.Scene, initialLevel: number) {
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.width = scene.scale.width;
    this.ratio = this.width / this.maxHealth;
    this.centerX = this.width / 2;
    this.setLevel(initialLevel);
    scene.add.existing(this.bar);
  }

  setLevel(health: number) {
    this.bar.clear();

    if (health <= 0)
      return;

    const color = this.getColor(health);
    this.bar.fillStyle(color);

    const distFromCenter = health * this.ratio / 2;
    const leftX = this.centerX - distFromCenter;
    const width = this.centerX + distFromCenter - leftX;
    this.bar.fillRect(leftX, 0, width, this.height);
  }

  private getColor(health: number): number {
    if (health < this.maxHealth * 0.2)
      return 0xff0000;

    if (health < this.maxHealth * 0.4)
      return 0xff8800;

    return 0x00ff00;
  }
}
