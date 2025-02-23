import { getMaxDuration } from './Phaser';

export class InputHandler {
  private leftKeys:  Phaser.Input.Keyboard.Key[];
  private rightKeys: Phaser.Input.Keyboard.Key[];
  private jumpKeys:  Phaser.Input.Keyboard.Key[];
  private escKey:    Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.leftKeys = [
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.LEFT]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.rightKeys = [
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.RIGHT]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.jumpKeys = [
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.UP]
      .map(kc => scene.input.keyboard.addKey(kc));
    this.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
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

  jumpIsPressed() {
    return this.jumpKeys.some(k => k.isDown);
  }

  /** Warning: Only call this once per key press.
      After being called, it will subsequently return false until the key is re-pressed. */
  jumpIsFreshlyPressed() {
    return this.jumpKeys.some(k => Phaser.Input.Keyboard.JustDown(k));
  }

  getJumpKeyDuration() {
    return getMaxDuration(this.jumpKeys);
  }

  escIsFreshlyPressed() {
    return Phaser.Input.Keyboard.JustDown(this.escKey);
  }

  private leftIsPressed() {
    return this.leftKeys.some(k => k.isDown);
  }

  private rightIsPressed() {
    return this.rightKeys.some(k => k.isDown);
  }
}

export enum XDirection {
  None = 0,
  Left = -1,
  Right = 1
}
