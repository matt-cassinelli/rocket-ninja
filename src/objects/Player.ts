import { InputHandler } from '../helpers/InputHandler';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: integer = 200;
  scene: Phaser.Scene;
  // [idea] body: Phaser.Physics.Arcade.Body;

  private LEFTRIGHT_FLOOR_SPEED = 300;
  private LEFTRIGHT_SPEED_LIMIT = 300;
  private LEFTRIGHT_INAIR_ACCEL = 999;
  private LEFTRIGHT_INAIR_DRAG = 200;
  private UPDOWN_SPEED_LIMIT = 999;
  private GROUND_JUMP_SPEED = 350;
  private WALL_JUMP_UP_SPEED = 290;
  private WALL_JUMP_AWAY_SPEED = 290;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene = scene;

    //_________INITIALISE PHYSICS_________//

    this.scene.physics.add.existing(this); // Add this physics body to the scene, this is required before any physics methods can be used (e.g. setBounce)
    this.setBounce(0); // 0.2
    this.setCollideWorldBounds(true); // Prevent going off-screen.
    this.setMaxVelocity(this.LEFTRIGHT_SPEED_LIMIT, this.UPDOWN_SPEED_LIMIT);
    this.setDrag(this.LEFTRIGHT_INAIR_DRAG, 0);
    // [idea] this.scene.physics.world.enable(this);
    // [old] this.setFriction(1000) // This method seemed to have no effect. Instead we mimic friction in the update() method by setting velocity when on ground, and setting accel. when in air.

    //_________INITIALISE GRAPHICS_________//

    const trail = this.scene.add.particles(
      this.x,
      this.y,
      'aura',
      {
        speed: 20,
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.5, end: 0 },
        blendMode: 'OVERLAY'
      }
    ); // If we don't put the emitter first, it appears in front of the player.

    trail.startFollow(this);

    this.setScale(0.95);
    this.scene.add.existing(this); // Add this sprite to the scene.
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1 // Loop forever.
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 20
    });
    // [old] this.setScale(0.5);
    // [old] this.setDisplaySize(40,40)

    this.depth = 1;
  }

  move(inputHandler: InputHandler) {
    if (inputHandler.rightPressed) { // If right key is pressed,
      this?.anims.play('right', true);
      if (this.body.blocked.down) { // And on ground,
        this.setVelocityX(this.LEFTRIGHT_FLOOR_SPEED); // Move immediately
        // [old] this.setAccelerationX(LEFTRIGHT_ACCEL_GROUNDED);
        this.setAccelerationX(0);
      }
      else { // But if in air,
        this.setAccelerationX(this.LEFTRIGHT_INAIR_ACCEL); // Move gradually
      }
    }
    else if (inputHandler.leftPressed) { // Same for left key
      this?.anims.play('left', true);
      if (this.body.blocked.down) {
        this.setVelocityX(-this.LEFTRIGHT_FLOOR_SPEED);
        // [old] this.setAccelerationX(-LEFTRIGHT_ACCEL_GROUNDED);
        this.setAccelerationX(0);
      }
      else {
        this.setAccelerationX(-this.LEFTRIGHT_INAIR_ACCEL);
      }
    }
    else { // If neither left or right are pressed,
      this?.anims.play('turn', true);
      this.setAccelerationX(0);
      if (this.body.blocked.down) { // If on ground,
        this?.setVelocityX(0); // Immediately halt.
      }
    }

    if (inputHandler.upPressed) { // If Jump is pressed,
      if (this.body.blocked.down) { // And player is on ground,
        this.setVelocityY(-this.GROUND_JUMP_SPEED); // Jump
      }
      else if (this.body.blocked.right) { // If player is by right wall
        this.setVelocity(-this.WALL_JUMP_AWAY_SPEED, -this.WALL_JUMP_UP_SPEED); // Jump up and away from wall
        // [old] this.setAccelerationX(-500);
      }
      else if (this.body.blocked.left) { // Same for left wall
        this.setVelocity(this.WALL_JUMP_AWAY_SPEED, -this.WALL_JUMP_UP_SPEED);
        // [old] this.setAccelerationX(500);
      }
    }
  }

  damage(amount: number) {
    this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}
