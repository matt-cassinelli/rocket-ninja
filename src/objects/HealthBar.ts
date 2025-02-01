export class HealthBar {
  bar: Phaser.GameObjects.Graphics;
  width: number;
  maxHealth = 190;
  ratio: number;
  centerX: number;
  height = 32;

  constructor(scene: Phaser.Scene, initialLevel: number) {
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.bar.alpha = 0.7;
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
    this.bar.alpha = this.getAlpha(health);

    const distFromCenter = health * this.ratio / 2;
    const leftX = this.centerX - distFromCenter;
    const width = this.centerX + distFromCenter - leftX;
    this.bar.fillRect(leftX, 0, width, this.height);
  }

  getColor(health: number) {
    if (health < this.maxHealth * 0.1)
      return 0xff0000;

    if (health < this.maxHealth * 0.2)
      return 0xff4400;

    if (health < this.maxHealth * 0.3)
      return 0xff8800;

    if (health < this.maxHealth * 0.4)
      return 0xdfdf00;

    return 0x00ff00;
  }

  getAlpha(health: number) {
    if (health < this.maxHealth * 0.1)
      return 1;
    if (health < this.maxHealth * 0.2)
      return 0.9;
    if (health < this.maxHealth * 0.3)
      return 0.8;
    if (health < this.maxHealth * 0.4)
      return 0.65;

    return 0.5;
  }
}
