export class InputHandler {
  private keyUp;
  private keyW;
  private keySpace;
  private keyLeft;
  private keyA;
  private keyRight;
  private keyD;
  private keyEsc;

  rightPressed = false;
  leftPressed = false;
  upPressed = false;
  attackPressed = false;
  escPressed = false;
  // [old] private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  // [old] private keyboard //: Phaser.Types.Input.Keyboard

  constructor(scene: Phaser.Scene) {
    // [old] this.cursors = this.input.keyboard.createCursorKeys()
    // [old] this.keyboard = scene.input.keyboard
    this.keyUp    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyW     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyLeft  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyA     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyD     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyEsc   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    this.upPressed = (this.keyUp.isDown || this.keyW.isDown || this.keySpace.isDown);
    this.leftPressed = (this.keyLeft.isDown || this.keyA.isDown);
    this.rightPressed = (this.keyRight.isDown || this.keyD.isDown);
    this.escPressed = this.keyEsc.isDown;
  }

  noInput() {
    return !(this.rightPressed || this.leftPressed || this.upPressed || this.attackPressed || this.escPressed);
  }
}
