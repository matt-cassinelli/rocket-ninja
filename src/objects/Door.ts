export class Door extends Phaser.GameObjects.Image {
  public isOpen: boolean;
  public leadsTo: string;
  public id: number;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'door-open');
    //console.log('Instantiating a Door with these properties:');
    //console.log(object.properties);
    this.isOpen  = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'IsOpen')?.value;
    this.leadsTo = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'LeadsTo')?.value;
    this.id = object.properties.find((x: Phaser.Types.Tilemaps.TiledObject) => x.name === 'DoorId')?.value;
    scene.add.existing(this);
    this.setDisplaySize(32, 32);
    scene.physics.add.existing(this, true); // 2nd argument means it should be Static.
  }

  public open(): void {
    this.isOpen = true;
    // TODO: Change graphics
  }

  public enter(): void {
    // this.scene.load('');
  }
}
