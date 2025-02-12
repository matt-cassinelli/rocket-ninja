import { randomInRange } from '../helpers/Helpers';
import { InputHandler } from '../helpers/InputHandler';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = 150;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;

  private config = {
    floor: {
      sidewaysSpeed: 290,
      jumpSpeed: 320
    },
    air: {
      accel: 1300,
      drag: 400,
      limit: 290
    },
    wall: {
      jumpUpSpeed: 220,
      jumpAwaySpeed: 300,
      slideSpeed: 30
    }
  };

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setOrigin(0.5, 1); // Map object represents bottom center of player.
    this.setDragX(this.config.air.drag);

    this.trail = this.scene.add.particles(0, 0, 'aura', {
      scale: { start: 0.25, end: 0.1 },
      angle: { min: 0, max: 360 },
      speed: { min: 9, max: 18 },
      alpha: { start: 0.3, end: 0 },
      frequency: 10,
      advance: 2000,
      blendMode: 'OVERLAY',
      follow: this,
      followOffset: { x: 0, y: -16 }
    });

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
    if (this.body.blocked.down && (inputHandler.rightPressed || inputHandler.leftPressed)) {
      if (!this.scene.sound.isPlaying('running')) {
        const stepCount = 19;
        const stepLengthMs = 294;
        const randomStep = Math.floor(Math.random() * stepCount); // 0 - 18
        const randomStartTimeSeconds = randomStep * stepLengthMs / 1000;
        this.scene.sound.play('running', { volume: 0.6, loop: true, seek: randomStartTimeSeconds });
      }
    }
    else {
      // TODO: Stop abrupt cut off
      this.scene.sound.stopByKey('running');
    }

    if (inputHandler.rightPressed) {
      if (this.body.blocked.down) { // On ground
        this.setVelocityX(this.config.floor.sidewaysSpeed); // Immediate
        this.setAccelerationX(0);
        this?.anims.play('right', true);
      }
      else { // In air
        if (this.body.blocked.right) {
          this.anims.play('wallslide-right', true);
          if (this.body.velocity.y >= this.config.wall.slideSpeed)
            this.setVelocityY(this.config.wall.slideSpeed);
        }
        else {
          this?.anims.play('right', true);
        }
        if (this.body.velocity.x < this.config.air.limit)
          this.setAccelerationX(this.config.air.accel); // Gradual
        else
          this.setAccelerationX(0); // TODO: Could this be removed?
      }
    }
    else if (inputHandler.leftPressed) {
      if (this.body.blocked.down) { // On ground
        this.setVelocityX(-this.config.floor.sidewaysSpeed); // Immediate
        this.setAccelerationX(0);
        this?.anims.play('left', true);
      }
      else { // In air
        if (this.body.blocked.left) {
          this.anims.play('wallslide-left', true);
          if (this.body.velocity.y >= this.config.wall.slideSpeed)
            this.setVelocityY(this.config.wall.slideSpeed);
        }
        else {
          this?.anims.play('left', true);
        }
        if (this.body.velocity.x > -this.config.air.limit)
          this.setAccelerationX(-this.config.air.accel); // Gradual
        else
          this.setAccelerationX(0);
      }
    }
    else { // Neither left or right are pressed
      this?.anims.play('turn', true);
      this.setAccelerationX(0);
      if (this.body.blocked.down) { // If on ground,
        this?.setVelocityX(0); // Immediately halt.
      }
    }

    if (inputHandler.upPressed) { // If Jump is pressed,
      if (this.body.blocked.down) { // And player is on ground,
        this.setVelocityY(-this.config.floor.jumpSpeed); // Jump
      }
      else if (this.body.blocked.right) { // If player is by right wall
        const upSpeed = this.body.velocity.y < -this.config.wall.jumpUpSpeed ? this.body.velocity.y - 50 : -this.config.wall.jumpUpSpeed;
        this.setVelocity(-this.config.wall.jumpAwaySpeed, upSpeed); // Jump up and away from wall
      }
      else if (this.body.blocked.left) { // Same for left wall
        const upSpeed = this.body.velocity.y < -this.config.wall.jumpUpSpeed ? this.body.velocity.y - 50 : -this.config.wall.jumpUpSpeed;
        this.setVelocity(this.config.wall.jumpAwaySpeed, upSpeed);
      }

      if (this.body.blocked.down || this.body.blocked.right || this.body.blocked.left)
        this.scene.sound.play('jump', { volume: randomInRange(8, 10) / 10, detune: randomInRange(-100, 200) });
    }

    // if (this.body.touching.left)
    //   this.setVelocityX(-1); // Hack to prevent restitution / seperation

    this.trail.lifespan = this.isMovingSignificantly() ? 3500 : 0;
  }

  isMovingSignificantly() {
    return Math.abs(this.body.velocity.x) > this.config.wall.slideSpeed
      || Math.abs(this.body.velocity.y) > this.config.wall.slideSpeed;
  }

  damage(amount: number) {
    this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}
