export class InputHandler {
  private keyUp:    Phaser.Input.Keyboard.Key;
  private keyW:     Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;
  private keyLeft:  Phaser.Input.Keyboard.Key;
  private keyA:     Phaser.Input.Keyboard.Key;
  private keyRight: Phaser.Input.Keyboard.Key;
  private keyD:     Phaser.Input.Keyboard.Key;
  private keyEsc:   Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    // TODO: Loop e.g. upKeys, rightKeys...
    this.keyUp    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyW     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyLeft  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyA     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyD     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyEsc   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  getXDirection(): XDirection {
    if (this.leftPressed() && this.rightPressed()) {
      const leftDuration = Math.max(this.keyA.getDuration(), this.keyLeft.getDuration());
      const rightDuration = Math.max(this.keyD.getDuration(), this.keyRight.getDuration());
      return leftDuration < rightDuration ? XDirection.Left : XDirection.Right;
    }

    if (this.leftPressed()) return XDirection.Left;
    if (this.rightPressed()) return XDirection.Right;
    return XDirection.None;
  }

  jumpPressed() {
    // Phaser.Input.Keyboard.JustDown(...)
    return this.keySpace.isDown || this.keyW.isDown || this.keyUp.isDown;
  }

  escPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keyEsc);
  }

  private leftPressed() {
    return this.keyLeft.isDown || this.keyA.isDown;
  }

  private rightPressed() {
    return this.keyRight.isDown || this.keyD.isDown;
  }
}

export enum XDirection {
  None = 0,
  Left = -1,
  Right = 1
}
