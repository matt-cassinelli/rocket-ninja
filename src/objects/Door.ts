export class Door extends Phaser.GameObjects.Image {

    public isOpen: boolean = true;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'door-open');
        scene.add.existing(this);
        this.setDisplaySize(32,32)
        scene.physics.add.existing(this, true); // 2nd argument means it should be Static.
    }
}