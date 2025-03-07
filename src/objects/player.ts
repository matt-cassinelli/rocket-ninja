import { randomInRange } from '../helpers/math';
import { InputHandler, XDirection } from '../helpers/input-handler';
import { SoundFader } from '../helpers/sound-fader';
import { GameScene } from '../scenes/game-scene';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = 150;
  touchedDownSinceLastDash: boolean;
  private dashStatus: 'DASHING' | 'RECHARGING' | 'AVAILABLE';
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private wallSlideSound: SoundFader;
  private dashXValue: number;
  private dashYValue: number;
  private speed = {
    x: {
      floor: 290,
      air: {
        accel: 1370,
        drag: 0.1, // 1 = none, 0 = complete stop.
        limit: 290,
        dash: 485,
        endOfDashBoost: 0.55
      },
      wallJump: 360
    },
    y: {
      floorJump: 440,
      air: {
        drag: 0.92,
        dash: 375,
        endOfDashBoost: 0.55,
        fall: {
          max: 700,
          boostBetween: {
            min: 0,
            max: 120,
            force: 2000
          }
        }
      },
      wallJump: {
        force: 330,
        preserveMomentum: 0.43
      },
      wallSlide: 37
    },
    dashDuration: 295,
    dashCooldown: 550
  };

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.dashStatus = 'AVAILABLE';
    this.touchedDownSinceLastDash = true;
    this.wallSlideSound = new SoundFader(scene, 'wall-slide', 0.25);
    this.setY(this.y - this.height / 2); // The map object represents the bottom center of player.
    this.setDamping(true);
    this.setDrag(this.speed.x.air.drag, this.speed.y.air.drag);
    this.initAnims();

    this.trail = this.scene.add.particles(0, 0, 'aura', {
      scale: { start: 0.29, end: 0.15 },
      rotate: { min: 0, max: 360 },
      speed: { min: 2, max: 5 },
      alpha: { start: 0.08, end: 0, ease: 'quint.out' },
      lifespan: { min: 3700, max: 3900 },
      frequency: 4,
      blendMode: Phaser.BlendModes.OVERLAY,
      follow: this,
      emitting: false
    });

    this.trail.setDepth(1);
    this.setDepth(2);
  }

  move(input: InputHandler) {
    const xDir = input.getXDirection();
    const leftOrRightIsPressed = xDir !== XDirection.None;
    const xDirLabel = leftOrRightIsPressed ? XDirection[xDir].toLowerCase() : null;
    const isOnFloor = this.body.blocked.down;
    const isInAir = !isOnFloor;
    const nearWall = this.body.blocked.right ? XDirection.Right : this.body.blocked.left ? XDirection.Left : null;
    const isPressingAgainstWall = xDir == nearWall;

    if (isOnFloor || !leftOrRightIsPressed) {
      this.setAccelerationX(0);
    }

    if (isOnFloor && !leftOrRightIsPressed) {
      this.setVelocityX(0);
    }

    if (leftOrRightIsPressed) {
      this.anims.play(xDirLabel, true);
    }

    if (!leftOrRightIsPressed) {
      this.anims.play('turn', true);
    }

    if (isOnFloor && leftOrRightIsPressed) {
      this.setVelocityX(this.speed.x.floor * xDir);
      this.playRunningSound();
    }

    if (isInAir || !leftOrRightIsPressed) {
      this.scene.sound.stopByKey('running');
    }

    if (isOnFloor && input.jumpIsPressed() && this.dashStatus != 'DASHING') {
      this.setVelocityY(-this.speed.y.floorJump);
      this.scene.sound.play('jump', {
        volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
      });
    }

    if (isInAir && leftOrRightIsPressed && this.dashStatus != 'DASHING') {
      this.moveThroughAir(this.speed.x.air.accel * xDir);
    }

    const shouldWallslide = isInAir && leftOrRightIsPressed && isPressingAgainstWall && this.dashStatus != 'DASHING';
    if (shouldWallslide) {
      if (this.body.velocity.y >= this.speed.y.wallSlide)
        this.setVelocityY(this.speed.y.wallSlide);
      this.anims.play(`wallslide-${xDirLabel}`, true);
      this.wallSlideSound.fadeInIfNotPlaying(300);
    }

    if (!shouldWallslide) {
      this.wallSlideSound.fadeOut(200);
    }

    const shouldWalljump = isInAir && nearWall && input.jumpIsPressed() && this.dashStatus != 'DASHING';
    if (shouldWalljump) {
      const upSpeed = this.body.velocity.y < 0
        ? this.speed.y.wallJump.force * -1 + (this.body.velocity.y * this.speed.y.wallJump.preserveMomentum)
        : this.speed.y.wallJump.force * -1;
      const awaySpeed = -this.speed.x.wallJump * nearWall;
      this.setVelocity(awaySpeed, upSpeed);
      this.scene.sound.play('jump', {
        volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
      });
    }

    const shouldStartDash = isInAir && input.dashIsPressed() && input.anyDirectionIsPressed()
      && this.dashStatus == 'AVAILABLE' && this.touchedDownSinceLastDash && !isPressingAgainstWall;
    if (shouldStartDash) {
      this.dashStatus = 'DASHING';
      this.touchedDownSinceLastDash = false;
      this.dashXValue = xDir !== XDirection.None ? this.speed.x.air.dash * xDir : 0;
      this.dashYValue = input.upIsPressed() ? this.speed.y.air.dash * -1 : input.downIsPressed() ? this.speed.y.air.dash : 0;
      this.scene.cameras.main.shake(80, 0.007);
      this.trail.emitting = true;
      (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.scene.sound.play('jump', {
        volume: randomInRange(7, 9) / 10, detune: randomInRange(210, 380)
      });

      this.scene.time.delayedCall(this.speed.dashDuration, () => {
        this.dashStatus = 'RECHARGING';
        this.dashXValue = this.dashYValue = 0;
        this.trail.emitting = false;
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
        this.setVelocityX(this.body.velocity.x * this.speed.x.air.endOfDashBoost);
        this.setVelocityY(this.body.velocity.y * this.speed.y.air.endOfDashBoost);
      });

      this.scene.time.delayedCall(this.speed.dashDuration + this.speed.dashCooldown, () => {
        this.dashStatus = 'AVAILABLE';
      });
    }

    if (this.dashStatus == 'DASHING') {
      this.setVelocity(this.dashXValue, this.dashYValue);
    }

    if (!this.touchedDownSinceLastDash && this.dashStatus != 'DASHING'
      && (isOnFloor || shouldWallslide || shouldWalljump)) {
      this.touchedDownSinceLastDash = true;
    }

    const isFallingSlow = isInAir && !isPressingAgainstWall
      && this.body.velocity.y > this.speed.y.air.fall.boostBetween.min
      && this.body.velocity.y < this.speed.y.air.fall.boostBetween.max;
    if (isFallingSlow)
      this.setGravityY(2000);
    else
      this.setGravityY(1);

    const isFallingFast = isInAir && this.body.velocity.y > this.speed.y.air.fall.max;
    if (isFallingFast)
      this.setDragY(0.33);
    else
      this.setDragY(this.speed.y.air.drag);

    // TODO: Prevent restitution / seperation
    // if (this.body.touching.left) this.setVelocityX(-1);
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
