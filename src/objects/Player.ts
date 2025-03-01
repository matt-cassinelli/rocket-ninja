import { clamp, randomInRange, createRangeMapper } from '../helpers/Helpers';
import { InputHandler, XDirection } from '../helpers/InputHandler';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = 150;
  private speed = {
    x: {
      floor: 290,
      air: {
        accel: 1370,
        drag: 450,
        limit: 290
      },
      wallJump: 345
    },
    y: {
      floorJump: 310,
      wallJump: 220,
      wallSlide: 30
    },
    thresholdForIntenseTrail: 590
  };

  private canDoubleJump: boolean; // TODO
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;

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

    if (xDir === XDirection.Left || xDir === XDirection.Right) {
      const xDirLabel = XDirection[xDir].toLowerCase();

      if (isOnFloor) {
        this.setVelocityX(this.speed.x.floor * xDir);
        this.setAccelerationX(0);
        this?.anims.play(xDirLabel, true);
        if (!this.scene.sound.isPlaying('running')) {
          this.playRunningSound();
        }
      }

      if (isInAir) {
        this.scene.sound.stopByKey('running');
        this.moveThroughAir(this.speed.x.air.accel * xDir);
        const isBumpingIntoWall =
          xDir == XDirection.Left ? this.body.blocked.left :
          xDir == XDirection.Right ? this.body.blocked.right :
          false;

        if (isBumpingIntoWall) {
          this.anims.play(`wallslide-${xDirLabel}`, true);
          if (this.body.velocity.y >= this.speed.y.wallSlide)
            this.setVelocityY(this.speed.y.wallSlide);
        }

        if (!isBumpingIntoWall)
          this?.anims.play(xDirLabel, true);
      }
    }

    if (xDir == XDirection.None) {
      this.scene.sound.stopByKey('running');
      this?.anims.play('turn', true);
      this.setAccelerationX(0);
      if (isOnFloor)
        this?.setVelocityX(0);
    }

    if (input.jumpPressed()) {
      if (isOnFloor)
        this.setVelocityY(-this.speed.y.floorJump);

      const nextToWall =
        this.body.blocked.right ? XDirection.Right :
        this.body.blocked.left ? XDirection.Left :
        null;

      if (isInAir && nextToWall) {
        const upSpeed = this.body.velocity.y < -this.speed.y.wallJump ?
          this.body.velocity.y - 50 : -this.speed.y.wallJump;
        const awaySpeed = -this.speed.x.wallJump * nextToWall;
        this.setVelocity(awaySpeed, upSpeed);
      }

      if (isOnFloor || (isInAir && nextToWall))
        this.scene.sound.play('jump', {
          volume: randomInRange(8, 10) / 10, detune: randomInRange(-100, 200)
        });
    }

    // TODO: Prevent restitution / seperation
    // if (this.body.touching.left) this.setVelocityX(-1);

    const currentSpeed = Math.max(Math.abs(this.body.velocity.x), Math.abs(this.body.velocity.y));
    const clampedSpeed = clamp(currentSpeed, 0, this.speed.thresholdForIntenseTrail);
    const trailIntensity = this.mapSpeedToTrailIntensity(clampedSpeed);
    this.trail.setFrequency(trailIntensity);
  }

  damage(amount: number) {
    this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
  }

  kill() {
    this.anims.pause();
    this.scene.sound.stopByKey('running');
    this.trail.lifespan = 0;
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
    const randomStep = Math.floor(Math.random() * stepCount); // 0 - 18
    const randomStartTimeSeconds = randomStep * stepLengthMs / 1000;
    this.scene.sound.play('running', { volume: 0.6, loop: true, seek: randomStartTimeSeconds });
  }

  private mapSpeedToTrailIntensity = createRangeMapper(
    { min: 0, max: this.speed.thresholdForIntenseTrail },
    { min: 17, max: 1 } // Lower = more intense.
  );

  //cleanUpOnMapEnd

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
