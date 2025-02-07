import { InputHandler } from '../helpers/InputHandler';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: integer = 150;
  trail: Phaser.GameObjects.Particles.ParticleEmitter;

  private LEFTRIGHT_FLOOR_SPEED = 290;
  private LEFTRIGHT_INAIR_LIMIT = 290;
  private LEFTRIGHT_INAIR_ACCEL = 1300;
  private LEFTRIGHT_INAIR_DRAG = 400;
  private GROUND_JUMP_SPEED = 320;
  private WALL_JUMP_UP_SPEED = 220;
  private WALL_JUMP_AWAY_SPEED = 300;
  private WALL_SLIDE_SPEED = 25;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene.physics.add.existing(this);
    this.setDragX(this.LEFTRIGHT_INAIR_DRAG);
    //this.setMass
    //this.setFriction
    //this.setBounceX(0); // -1

    this.trail = this.scene.add.particles(0, 0, 'aura', {
      scale: { start: 0.25, end: 0.1 },
      angle: { min: 0, max: 360 },
      speed: { min: 9, max: 18 },
      alpha: { start: 0.3, end: 0 },
      frequency: 10,
      advance: 2000,
      blendMode: 'OVERLAY',
      follow: this
    });

    this.scene.add.existing(this);
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 4 }]
    });
    this.anims.create({
      key: 'wallslide-left',
      frames: [{ key: 'player', frame: 10 }]
    });
    this.anims.create({
      key: 'wallslide-right',
      frames: [{ key: 'player', frame: 9 }]
    });

    this.setDepth(2);
    this.trail.setDepth(1);
  }

  move(inputHandler: InputHandler) {
    if (inputHandler.rightPressed) {
      if (this.isOnGround()) {
        this.setVelocityX(this.LEFTRIGHT_FLOOR_SPEED); // Immediate
        this.setAccelerationX(0);
        this?.anims.play('right', true);
      }
      else { // In air
        if (this.body.blocked.right) {
          this.anims.play('wallslide-right', true);
          if (this.body.velocity.y >= this.WALL_SLIDE_SPEED)
            this.setVelocityY(this.WALL_SLIDE_SPEED);
        }
        else {
          this?.anims.play('right', true);
        }
        if (this.body.velocity.x < this.LEFTRIGHT_INAIR_LIMIT)
          this.setAccelerationX(this.LEFTRIGHT_INAIR_ACCEL); // Gradual
        else
          this.setAccelerationX(0); // TODO: Could this be removed?
      }
    }
    else if (inputHandler.leftPressed) {
      if (this.isOnGround()) {
        this.setVelocityX(-this.LEFTRIGHT_FLOOR_SPEED); // Immediate
        this.setAccelerationX(0);
        this?.anims.play('left', true);
      }
      else { // In air
        if (this.body.blocked.left) {
          this.anims.play('wallslide-left', true);
          if (this.body.velocity.y >= this.WALL_SLIDE_SPEED)
            this.setVelocityY(this.WALL_SLIDE_SPEED);
        }
        else {
          this?.anims.play('left', true);
        }
        if (this.body.velocity.x > -this.LEFTRIGHT_INAIR_LIMIT)
          this.setAccelerationX(-this.LEFTRIGHT_INAIR_ACCEL); // Gradual
        else
          this.setAccelerationX(0);
      }
    }
    else { // Neither left or right are pressed
      this?.anims.play('turn', true);
      this.setAccelerationX(0);
      if (this.isOnGround()) { // If on ground,
        this?.setVelocityX(0); // Immediately halt.
      }
    }

    if (inputHandler.upPressed) { // If Jump is pressed,
      if (this.isOnGround()) { // And player is on ground,
        this.setVelocityY(-this.GROUND_JUMP_SPEED); // Jump
      }
      else if (this.body.blocked.right) { // If player is by right wall
        const upSpeed = this.body.velocity.y < -this.WALL_JUMP_UP_SPEED ? this.body.velocity.y - 50 : -this.WALL_JUMP_UP_SPEED;
        this.setVelocity(-this.WALL_JUMP_AWAY_SPEED, upSpeed); // Jump up and away from wall
      }
      else if (this.body.blocked.left) { // Same for left wall
        const upSpeed = this.body.velocity.y < -this.WALL_JUMP_UP_SPEED ? this.body.velocity.y - 50 : -this.WALL_JUMP_UP_SPEED;
        this.setVelocity(this.WALL_JUMP_AWAY_SPEED, upSpeed);
      }
    }

    // if (this.body.touching.left)
    //   this.setVelocityX(-1); // Hack to prevent restitution / seperation

    this.trail.lifespan = this.isMovingSignificantly() ? 3500 : 0;
  }

  isOnGround() {
    return this.body.blocked.down;
  }

  isMovingSignificantly() {
    return Math.abs(this.body.velocity.x) > this.WALL_SLIDE_SPEED
      || Math.abs(this.body.velocity.y) > this.WALL_SLIDE_SPEED;
  }

  damage(amount: number) {
    this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}
