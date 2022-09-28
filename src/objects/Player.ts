import { Physics } from "phaser"

export class Player extends Phaser.Physics.Arcade.Sprite {
    isDead: Boolean = false;
    scene: Phaser.Scene

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player')
        this.scene = scene;
        this.initPhysics();
        this.initGraphics();
    }

    private initGraphics() {
      this.scene.add.existing(this); // Add this Player to the scene
      //this.setScale(0.5);
      //this.setDisplaySize(40,40)
      this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1 // Loop forever.
      })
      this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
      })
      this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4} ],
        frameRate: 20
      })
    }
  
    private initPhysics() {
      this.scene.physics.add.existing(this); // Add this Player's Arcade Physics Body to the scene - required before any physics methods can be used (e.g. setBounce)
      this.setBounce(0.2);
      this.setCollideWorldBounds(true); // Prevent leaving the screen.
      //this.body.setVelocity(100, 200);
      //this.scene.physics.world.enable(this);
    }

    update(cursors: any) {
      if (!cursors) { // Nothing being pressed
        return
      }
      if (cursors.left?.isDown) { // Optional chaining (sometimes a cursor is undefined)
        this?.setVelocityX(-160)
        this?.anims.play('left', true)
      }
      else if (cursors.right?.isDown) {
        this?.setVelocityX(160)
        this?.anims.play('right', true)
      }
      else {
        this?.setVelocityX(0)
        this?.anims.play('turn', true)
      }
      if (cursors.up?.isDown && this?.body.touching.down) {
        this?.setVelocityY(-330) // Jump.
      }
    }

    kill() {
      //console.log(this); // Debug
      this.isDead = true;
      this.scene.cameras.main.shake(500, 0.02)
      this.setTint(0xff0000)
      this.anims.play('turn')
    }
}