import { randomInRange, createRangeMapper } from '../helpers/math';
import { InputHandler, XDirection } from '../helpers/input-handler';
import { SoundFader } from '../helpers/sound-fader';
import { GameScene } from '../scenes/game-scene';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = 150;
  jumpsRemaining: number;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private wallSlideSound: SoundFader;
  private speed = {
    x: {
      floor: 290,
      air: {
        accel: 1370,
        drag: 0.1, // 1 = none, 0 = complete stop.
        limit: 290,
        jump: 290
      },
      wallJump: 350
    },
    y: {
      floorJump: 450,
      air: {
        jump: 350,
        drag: 0.92,
        fallThresholdForHardDrag: 500,
        hardDrag: 0.4
      },
      wallJump: 300,
      wallSlide: 35
    },
    thresholdForIntenseTrail: 740
  };

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.wallSlideSound = new SoundFader(scene, 'wall-slide', 0.3);
    this.setY(this.y - this.height / 2); // The map object represents the bottom center of player.
    this.setDamping(true);
    this.setDrag(this.speed.x.air.drag, this.speed.y.air.drag);
    this.initAnims();
    this.setDepth(2);

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

    this.trail.setDepth(1);
  }

  move(input: InputHandler) {
    const xDir = input.getXDirection();
    const leftOrRightIsPressed = xDir !== XDirection.None;
    const xDirLabel = leftOrRightIsPressed ? XDirection[xDir].toLowerCase() : null;
    const isOnFloor = this.body.blocked.down;
    const isInAir = !isOnFloor;
    const nearWall = this.body.blocked.right ? XDirection.Right : this.body.blocked.left ? XDirection.Left : null;
    const isPressingAgainstWall = xDir == nearWall;

    if (!leftOrRightIsPressed) {
      this.anims.play('turn', true);
      this.setAccelerationX(0);
      if (isOnFloor) {
        this.setVelocityX(0);
        this.jumpsRemaining = 2;
      }
    }

    if (leftOrRightIsPressed && isOnFloor) {
      this.setVelocityX(this.speed.x.floor * xDir);
      this.setAccelerationX(0);
      this.anims.play(xDirLabel, true);
      this.playRunningSound();
      this.jumpsRemaining = 2;
    }
    else {
      this.scene.sound.stopByKey('running');
    }

    if (leftOrRightIsPressed && isInAir) {
      this.moveThroughAir(this.speed.x.air.accel * xDir);
      this.jumpsRemaining = Math.min(this.jumpsRemaining, 1);
      this.anims.play(xDirLabel, true);
    }

    if (leftOrRightIsPressed && isInAir && isPressingAgainstWall) {
      if (this.body.velocity.y >= this.speed.y.wallSlide)
        this.setVelocityY(this.speed.y.wallSlide);
      this.jumpsRemaining = 1;
      this.anims.play(`wallslide-${xDirLabel}`, true);
      this.wallSlideSound.fadeInIfNotPlaying(300);
    }
    else {
      this.wallSlideSound.fadeOut(200);
    }

    if (input.jumpIsFreshlyPressed() && isInAir && !isPressingAgainstWall && this.jumpsRemaining > 0) {
      this.setVelocityY(-this.speed.y.air.jump);
      this.scene.sound.play('jump', {
        volume: randomInRange(7, 9) / 10, detune: randomInRange(210, 380)
      });
      this.scene.cameras.main.shake(80, 0.007);
      this.jumpsRemaining = 0;
    }

    if (isInAir && this.body.velocity.y > this.speed.y.air.fallThresholdForHardDrag)
      this.setDragY(this.speed.y.air.hardDrag);
    else
      this.setDragY(this.speed.y.air.drag);
    //console.log(`Fall speed: ${this.body.velocity.y}`);

    if (input.jumpIsPressed() && isOnFloor) {
      this.setVelocityY(-this.speed.y.floorJump);
      this.scene.sound.play('jump', {
        volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
      });
      this.jumpsRemaining = 1;
    }

    if (input.jumpIsPressed() && isInAir && nearWall) {
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

    // TODO: Prevent restitution / seperation
    // if (this.body.touching.left) this.setVelocityX(-1);

    const currentSpeed = Math.max(Math.abs(this.body.velocity.x), Math.abs(this.body.velocity.y));
    const trailIntensity = this.mapSpeedToTrailIntensity(currentSpeed);
    this.trail.setFrequency(trailIntensity);
  }

  damage(amount: number) {
    if (amount > 5)
      this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
    (this.scene as GameScene).healthBar.setLevel(this.health);
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
    if (this.scene.sound.isPlaying('running')) return;
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
