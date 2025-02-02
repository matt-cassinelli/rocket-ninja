import { InputHandler } from '../helpers/InputHandler';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: integer = 170;
  scene: Phaser.Scene;
  trail: Phaser.GameObjects.Particles.ParticleEmitter;

  private LEFTRIGHT_FLOOR_SPEED = 300;
  private LEFTRIGHT_INAIR_LIMIT = 300;
  private LEFTRIGHT_INAIR_ACCEL = 1400;
  private LEFTRIGHT_INAIR_DRAG = 400;
  private GROUND_JUMP_SPEED = 350;
  private WALL_JUMP_UP_SPEED = 220;
  private WALL_JUMP_AWAY_SPEED = 300;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene = scene;
    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDrag(this.LEFTRIGHT_INAIR_DRAG, 0);

    this.trail = this.scene.add.particles(0, 0, 'aura', {
      scale: { start: 0.25, end: 0.1 },
      speed: { min: 10, max: 18 },
      alpha: { start: 0.3, end: 0, ease: 'sine.out' },
      lifespan: 3500,
      frequency: 10,
      advance: 2000,
      blendMode: 'OVERLAY',
      follow: this
    });

    this.scene.add.existing(this);
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

    this.depth = 1;
  }

  move(inputHandler: InputHandler) {
    this.trail.lifespan = 3500;
    if (inputHandler.rightPressed) {
      this?.anims.play('right', true);
      if (this.isOnGround()) {
        this.setVelocityX(this.LEFTRIGHT_FLOOR_SPEED); // Immediate
        this.setAccelerationX(0);
      }
      else { // In air
        if (this.body.velocity.x < this.LEFTRIGHT_INAIR_LIMIT)
          this.setAccelerationX(this.LEFTRIGHT_INAIR_ACCEL); // Gradual
        else
          this.setAccelerationX(0);
      }
    }
    else if (inputHandler.leftPressed) {
      this?.anims.play('left', true);
      if (this.isOnGround()) {
        this.setVelocityX(-this.LEFTRIGHT_FLOOR_SPEED); // Immediate
        this.setAccelerationX(0);
      }
      else { // In air
        if (this.body.velocity.x > -this.LEFTRIGHT_INAIR_LIMIT)
          this.setAccelerationX(-this.LEFTRIGHT_INAIR_ACCEL); // Gradual
        else
          this.setAccelerationX(0);
      }
    }
    else { // Neither left or right are pressed
      this?.anims.play('turn', true);
      this.setAccelerationX(0);
      if (this.body.blocked.down) { // If on ground,
        this.trail.lifespan = 0;
        this?.setVelocityX(0); // Immediately halt.
      }
    }

    if (inputHandler.upPressed) { // If Jump is pressed,
      if (this.body.blocked.down) { // And player is on ground,
        this.setVelocityY(-this.GROUND_JUMP_SPEED); // Jump
      }
      else if (this.body.blocked.right) { // If player is by right wall
        this.setVelocity(-this.WALL_JUMP_AWAY_SPEED, -this.WALL_JUMP_UP_SPEED); // Jump up and away from wall
      }
      else if (this.body.blocked.left) { // Same for left wall
        this.setVelocity(this.WALL_JUMP_AWAY_SPEED, -this.WALL_JUMP_UP_SPEED);
      }
    }
  }

  isOnGround() {
    return this.body.blocked.down;
  }

  damage(amount: number) {
    this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}
