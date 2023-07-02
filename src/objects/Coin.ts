export class Coin extends Phaser.GameObjects.Image {

    readonly value: integer; // Ranges from 1-10

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'coin');
        // [old] this.scene = scene;
        scene.add.existing(this);

        this.value = Math.round(
            (Math.random() * 9) + 1
        );
        this.setScale(1 + (this.value * 0.1));
        // [idea] this.setDisplaySize(40,40)
        // [dbg] console.log(this)
    }

    // [idea]
    // collect() {
    // this.disableBody(true, true)
    // this.setActive(false);
    // this.visible = false;
    // this.destroy()
    // }
}