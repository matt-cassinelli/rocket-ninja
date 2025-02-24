import { randomInRange } from '../helpers/math';
import { getCustomProperty } from '../helpers/phaser';
import { Door } from './door';

export class Key extends Phaser.Physics.Arcade.Image {
  public readonly forDoor: integer;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'key');

    this.forDoor = getCustomProperty(object, 'ForDoor');
    this.setDisplaySize(28, 28);

    const hoverIntensity = 4;
    scene.tweens.add({
      targets: this,
      y: this.y - hoverIntensity,
      duration: randomInRange(950, 1300),
      delay: randomInRange(0, 500),
      ease: 'Sine.easeInOut',
      yoyo: true,
      loop: -1
    });

    scene.add.existing(this);
  }

  collect(door: Door) {
    if (this.forDoor === door.id)
      door.open();

    this.destroy();
  }
}
