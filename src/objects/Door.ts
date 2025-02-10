import { getCustomProperty } from '../helpers/Helpers';

export class Door extends Phaser.Physics.Arcade.Sprite {
  public isOpen: boolean;
  public leadsTo: string;
  public id: number;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'door');
    //console.log('Creating a Door with these properties:');
    //console.log(object.properties);

    this.setOrigin(0.5, 1); // Point is at bottom center of door.
    this.leadsTo = getCustomProperty(object, 'LeadsTo');
    this.id = getCustomProperty(object, 'DoorId');

    this.anims.create({
      key: 'open',
      frames: this.anims.generateFrameNumbers('door', { start: 0, end: 5 }),
      frameRate: 5
    });

    if (getCustomProperty<boolean>(object, 'IsOpen') === true)
      this.open();

    scene.physics.add.existing(this, true);
    scene.add.existing(this);

    this.setDepth(0);
  }

  public open() {
    this.isOpen = true;
    this.anims.play('open');
    this.scene.sound.play('door-open', { volume: 0.7 });
    // this.scene.load('');
  }
}
