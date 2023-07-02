import { GameScene } from '../scenes/GameScene';

export class Door extends Phaser.GameObjects.Image {

    public isOpen?: boolean = true;
    public leadsTo?: string;

    constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
        super(scene, object.x, object.y, 'door-open');
        //console.log('Instantiating a Door with these properties:' + object.properties);
        this.isOpen  = object.properties.find((x:any) => x.name === 'IsOpen')?.value;
        this.leadsTo = object.properties.find((x:any) => x.name === 'LeadsTo')?.value
        scene.add.existing(this);
        this.setDisplaySize(32,32)
        scene.physics.add.existing(this, true); // 2nd argument means it should be Static.
    }

    public enter(): void {
        // this.scene.load('');
    }
}