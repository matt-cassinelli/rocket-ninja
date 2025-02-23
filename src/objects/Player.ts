import { randomInRange, createRangeMapper } from '../helpers/Math';
import { InputHandler, XDirection } from '../helpers/InputHandler';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = 150;
  jumpsRemaining: number;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private speed = {
    x: {
      floor: 290,
      air: {
        accel: 1370,
        drag: 450,
        limit: 290,
        jump: 290
      },
      wallJump: 345
    },
    y: {
      floorJump: 310,
      airJump: 260,
      wallJump: 220,
      wallSlide: 30
    },
    thresholdForIntenseTrail: 590
  };

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setOrigin(0.5, 1); // The map object represents the bottom center of player.
    this.setDragX(this.speed.x.air.drag);

    this.trail = this.scene.add.particles(0, 0, 'aura', {
      scale: { start: 0.29, end: 0.15 },
      rotate: { min: 0, max: 360 },
      speed: { min: 7, max: 30 },
      alpha: { start: 0.09, end: 0, ease: 'quint.out' },
      lifespan: { min: 4000, max: 4200 },
      blendMode: Phaser.BlendModes.OVERLAY,
      follow: this,
      followOffset: { x: 0, y: -14 }
    });

    this.initAnims();
    this.setDepth(2);
    this.trail.setDepth(1);
  }

  move(input: InputHandler) {
    const xDir = input.getXDirection();
    const isOnFloor = this.body.blocked.down;
    const isInAir = !isOnFloor;
    const nearWall = this.body.blocked.right ? XDirection.Right : this.body.blocked.left ? XDirection.Left : null;
    const isPressingAgainstWall = xDir == nearWall;

    if (xDir == XDirection.None) {
      this.scene.sound.stopByKey('running');
      this.anims.play('turn', true);
      this.setAccelerationX(0);
      if (isOnFloor) {
        this?.setVelocityX(0);
        this.jumpsRemaining = 2;
      }
    }

    if (xDir === XDirection.Left || xDir === XDirection.Right) {
      const xDirLabel = XDirection[xDir].toLowerCase();

      if (isOnFloor) {
        this.setVelocityX(this.speed.x.floor * xDir);
        this.setAccelerationX(0);
        this.anims.play(xDirLabel, true);
        if (!this.scene.sound.isPlaying('running')) {
          this.playRunningSound();
        }
        this.jumpsRemaining = 2;
      }

      if (isInAir) {
        this.scene.sound.stopByKey('running');
        this.moveThroughAir(this.speed.x.air.accel * xDir);

        if (isPressingAgainstWall) {
          this.anims.play(`wallslide-${xDirLabel}`, true);
          if (this.body.velocity.y >= this.speed.y.wallSlide)
            this.setVelocityY(this.speed.y.wallSlide);
          this.jumpsRemaining = 1;
        }
        else {
          this.anims.play(xDirLabel, true);
        }

        this.jumpsRemaining = Math.min(this.jumpsRemaining, 1);
      }
    }

    if (input.jumpIsFreshlyPressed() && isInAir && !isPressingAgainstWall && this.jumpsRemaining > 0) {
      this.setVelocityY(-this.speed.y.airJump);
      this.scene.sound.play('jump', {
        volume: randomInRange(7, 9) / 10, detune: randomInRange(210, 380)
      });
      this.scene.cameras.main.shake(80, 0.007);
      this.jumpsRemaining = 0;
    }

    if (input.jumpIsPressed()) {
      if (isOnFloor) {
        this.setVelocityY(-this.speed.y.floorJump);
        this.scene.sound.play('jump', {
          volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
        });
        this.jumpsRemaining = 1;
      }
      if (isInAir && nearWall) {
        const upSpeed = this.body.velocity.y < -this.speed.y.wallJump
          ? this.body.velocity.y - 50
          : -this.speed.y.wallJump;
        const awaySpeed = -this.speed.x.wallJump * nearWall;
        this.setVelocity(awaySpeed, upSpeed);
        this.scene.sound.play('jump', {
          volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
        });
        this.jumpsRemaining = 1;
      }
    }

    // TODO: Prevent restitution / seperation
    // if (this.body.touching.left) this.setVelocityX(-1);

    const currentSpeed = Math.max(Math.abs(this.body.velocity.x), Math.abs(this.body.velocity.y));
    const trailIntensity = this.mapSpeedToTrailIntensity(currentSpeed);
    this.trail.setFrequency(trailIntensity);
  }

  damage(amount: number) {
    this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
  }

  cleanUpOnMapEnd() {
    this.anims.pause();
    this.trail.emitting = false;
    this.scene.sound.stopByKey('running');
    // this.disableBody(true, true)
  }

  private moveThroughAir(airAccel: number) {
    if (Math.abs(this.body.velocity.x) < this.speed.x.air.limit)
      this.setAccelerationX(airAccel);
    else
      this.setAccelerationX(0); // TODO: Could this be removed?
  }

  private playRunningSound() {
    const stepCount = 19;
    const stepLengthMs = 294;
    const randomStep = randomInRange(0, stepCount - 1);
    const randomStartTimeSeconds = randomStep * stepLengthMs / 1000;
    this.scene.sound.play('running', { volume: 0.6, loop: true, seek: randomStartTimeSeconds });
  }

  private mapSpeedToTrailIntensity = createRangeMapper(
    { min: 0, max: this.speed.thresholdForIntenseTrail },
    { min: 17, max: 1 } // Lower = more intense.
  );

  private initAnims() {
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
  }
}
