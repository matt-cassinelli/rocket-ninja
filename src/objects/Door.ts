export class Door extends Phaser.Physics.Arcade.Sprite {
  public isOpen: boolean;
  public leadsTo: string;
  public id: number;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'door');
    //console.log('Creating a Door with these properties:');
    //console.log(object.properties);

    this.leadsTo = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'LeadsTo')?.value;
    this.id = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'DoorId')?.value;

    this.anims.create({
      key: 'open',
      frames: this.anims.generateFrameNumbers('door', { start: 0, end: 5 }),
      frameRate: 5
    });

    if (object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'IsOpen')?.value === true) {
      this.open();
    }
    scene.physics.add.existing(this, true);
    scene.add.existing(this);
  }

  public open(): void {
    this.isOpen = true;
    this.anims.play('open');
    // TODO: Change graphics
  }

  public enter(): void {
    // this.scene.load('');
  }
}
