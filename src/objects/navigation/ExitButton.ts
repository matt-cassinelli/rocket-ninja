export default class ExitButton extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'exit-icon');

    this.setDisplaySize(50, 50);
    this.setOrigin(0);
    this.setScrollFactor(0);
    this.drawNormal();

    this.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this.drawNormal)
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this.drawHover)
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.click);
  }

  private drawNormal() {
    this.setTint(0xdddddd);
    this.setAlpha(0.7);
  }

  private drawHover() {
    this.setTint(0x6699ff);
    this.setAlpha(1);
  }

  private click() {
    this.scene.scene.start('MenuScene');
  }
}
