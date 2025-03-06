import { getMaxDuration } from './phaser';
const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

/** Warning: The 'isFreshlyPressed' methods should be called only once per key press.
    After being called, they will return false until the key is re-pressed. */
export class InputHandler {
  private leftKeys:  Phaser.Input.Keyboard.Key[];
  private rightKeys: Phaser.Input.Keyboard.Key[];
  private upKeys:    Phaser.Input.Keyboard.Key[];
  private downKeys:  Phaser.Input.Keyboard.Key[];
  private jumpKeys:  Phaser.Input.Keyboard.Key[];
  private dashKeys:  Phaser.Input.Keyboard.Key[];
  private escKey:    Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.leftKeys = [KeyCodes.LEFT, KeyCodes.A]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.rightKeys = [KeyCodes.RIGHT, KeyCodes.D]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.upKeys = [KeyCodes.UP, KeyCodes.W]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.downKeys = [KeyCodes.DOWN, KeyCodes.S]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.jumpKeys = [KeyCodes.Z, KeyCodes.SPACE, KeyCodes.P]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.dashKeys = [KeyCodes.X, KeyCodes.O, KeyCodes.B]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.escKey = scene.input.keyboard.addKey(KeyCodes.ESC);
  }

  getXDirection(): XDirection {
    if (this.leftIsPressed() && this.rightIsPressed())
      return getMaxDuration(this.leftKeys) < getMaxDuration(this.rightKeys)
        ? XDirection.Left
        : XDirection.Right;

    if (this.leftIsPressed()) return XDirection.Left;
    if (this.rightIsPressed()) return XDirection.Right;
    return XDirection.None;
  }

  getFreshlyPressedXDirection(): XDirection {
    if (this.leftKeys.some(k => Phaser.Input.Keyboard.JustDown(k)))
      return XDirection.Left;

    if (this.rightKeys.some(k => Phaser.Input.Keyboard.JustDown(k)))
      return XDirection.Right;

    return XDirection.None;
  }

  anyDirectionIsPressed = () =>
    this.getXDirection() !== XDirection.None
    || this.upIsPressed()
    || this.downIsPressed();

  upIsPressed = () => this.upKeys.some(k => k.isDown);
  downIsPressed = () => this.downKeys.some(k => k.isDown);
  leftIsPressed = () => this.leftKeys.some(k => k.isDown);
  rightIsPressed = () => this.rightKeys.some(k => k.isDown);
  dashIsPressed = () => this.dashKeys.some(k => k.isDown);
  jumpIsPressed = () => this.jumpKeys.some(k => k.isDown);
  jumpIsFreshlyPressed = () => this.jumpKeys.some(k => Phaser.Input.Keyboard.JustDown(k));
  getJumpKeyDuration = () => getMaxDuration(this.jumpKeys);
  escIsFreshlyPressed = () => Phaser.Input.Keyboard.JustDown(this.escKey);
}

export enum XDirection {
  None = 0,
  Left = -1,
  Right = 1
}
