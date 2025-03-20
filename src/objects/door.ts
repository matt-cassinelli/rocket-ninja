import { getCustomProperty } from '../helpers/phaser';

export class Door extends Phaser.Physics.Matter.Sprite {
  public isOpen: boolean;
  public leadsTo: string;
  public id: number;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene.matter.world, object.x, object.y, 'door');

    this.setY(this.y - this.height / 2); // Point is at bottom center of door.
    this.setStatic(true);
    this.setSensor(true);
    this.setDepth(0);

    this.leadsTo = getCustomProperty(object, 'LeadsTo');
    this.id = getCustomProperty(object, 'DoorId');

    this.anims.create({
      key: 'open',
      frames: this.anims.generateFrameNumbers('door', { start: 0, end: 5 }),
      frameRate: 5
    });

    if (getCustomProperty<boolean>(object, 'IsOpen') === true)
      this.open();

    scene.add.existing(this);
  }

  public open() {
    this.isOpen = true;
    this.anims.play('open');
    this.scene.sound.play('door-open', { volume: 0.7 });
    // this.scene.load('');
  }
}
