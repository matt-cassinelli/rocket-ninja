import { randomInRange } from '../helpers/math';
import { getCustomProperty } from '../helpers/phaser';
import { Door } from './door';

export class Key extends Phaser.Physics.Matter.Image {
  public readonly forDoor: integer;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene.matter.world, object.x, object.y, 'key');

    this.forDoor = getCustomProperty(object, 'ForDoor');
    this.setDisplaySize(28, 28);
    this.setStatic(true);
    this.setSensor(true);

    const hoverIntensity = 4;
    const hoverTween = scene.tweens.add({
      targets: this,
      y: this.y - hoverIntensity,
      duration: randomInRange(950, 1300),
      delay: randomInRange(0, 500),
      ease: 'Sine.easeInOut',
      yoyo: true,
      loop: -1
    });
    this.on('destroy', () => {
      hoverTween.destroy();
    });

    scene.add.existing(this);
  }

  collect(door: Door) {
    if (this.forDoor === door.id)
      door.open();

    this.destroy();
  }
}
