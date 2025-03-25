import { randomInRange } from '../helpers/math';
import { InputHandler, XDirection } from '../helpers/input-handler';
import { SoundFader } from '../helpers/sound-fader';
import { GameScene } from '../scenes/game-scene';
import { BodyType } from 'matter';

export class Player {
  health = 150;
  sprite: Phaser.Physics.Matter.Sprite;
  private scene: Phaser.Scene;
  private sensors: { bottom: BodyType; left: BodyType; right: BodyType; };
  private touching: { left: boolean; right: boolean; bottom: boolean; };
  private dashXValue: number;
  private dashYValue: number;
  private touchedDownSinceLastDash: boolean;
  private affectedByJumpPad: boolean;
  private dashStatus: 'DASHING' | 'RECHARGING' | 'AVAILABLE';
  private recentlyWallJumped: boolean;
  private isJumping: boolean;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private wallSlideSound: SoundFader;
  private squashTween: Phaser.Tweens.Tween;
  //private hasReducedGravity: boolean;
  private speed = {
    floor: {
      run: 5.5,
      jump: 10.6,
      friction: 0.3
    },
    air: {
      x: {
        accel: 0.0017,
        limit: 5.5,
        halt: 0.16
      },
      fall: {
        max: 11.7,
        boostBetween: {
          min: 0.05,
          max: 3,
          force: 0 // 0.0015
        }
      },
      resistance: 0.014
    },
    dash: {
      x: 11.5,
      y: 8.7,
      endBoost: 0.55,
      durationMs: 250,
      cooldownMs: 550
    },
    wallJump: {
      x: 7.3,
      y: 7,
      preserveUpMomentum: 0.5,
      reducedAirControlMs: 300
    },
    wallSlide: 0.15
  };

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    this.scene = scene;
    this.sprite = scene.matter.add.sprite(0, 0, 'player', 4)
      .setDepth(2)
      .setScale(1.1);

    this.createAnimations();
    this.createPhysicsBody();

    this.sprite // The map object represents the bottom center of player.
      .setPosition(object.x, object.y - this.sprite.height / 2)
      .setFixedRotation();

    this.dashStatus = 'AVAILABLE';
    this.touchedDownSinceLastDash = true;
    this.wallSlideSound = new SoundFader(scene, 'wall-slide', 0.25);

    this.trail = this.scene.add.particles(0, 0, 'aura', {
      scale: { start: 0.29, end: 0.15 },
      rotate: { min: 0, max: 360 },
      speed: { min: 2, max: 5 },
      alpha: { start: 0.08, end: 0, ease: 'quint.out' },
      lifespan: { min: 3700, max: 3900 },
      frequency: 4,
      blendMode: Phaser.BlendModes.OVERLAY,
      follow: this.sprite,
      emitting: false
    });
    this.trail.setDepth(1);

    this.squashTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.97,
      yoyo: true,
      duration: 200,
      paused: true,
      persist: true
    });
  }

  move(input: InputHandler) { // TODO: Add delta
    const xDir = input.getXDirection();
    const leftOrRightIsPressed = xDir !== XDirection.None;
    const xDirLabel = leftOrRightIsPressed ? XDirection[xDir].toLowerCase() : null;
    const isOnFloor = this.touching.bottom;
    const isInAir = !isOnFloor;
    const nearWall = this.touching.right ? XDirection.Right : this.touching.left ? XDirection.Left : null;
    const isPressingAgainstWall = xDir == nearWall;

    if (leftOrRightIsPressed)
      this.sprite.anims.play(xDirLabel, true);

    if (!leftOrRightIsPressed)
      this.sprite.anims.play('turn', true);

    if (isOnFloor || isPressingAgainstWall || this.dashStatus == 'DASHING' || this.affectedByJumpPad)
      this.isJumping = false;

    if (isOnFloor && leftOrRightIsPressed && !this.affectedByJumpPad) {
      this.sprite.setVelocityX(this.speed.floor.run * xDir);
      this.playRunningSound();
    }

    if (isInAir || !leftOrRightIsPressed)
      this.scene.sound.stopByKey('running');

    if (isOnFloor && input.jumpIsPressed() && this.dashStatus != 'DASHING') {
      this.isJumping = true;
      this.sprite.setVelocityY(-this.speed.floor.jump);
      this.squashTween.play();
      this.scene.sound.play('jump', {
        volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
      });
    }

    const shouldAllowAirXControl = isInAir && leftOrRightIsPressed && this.dashStatus != 'DASHING'
      && this.sprite.body.velocity.x * xDir < this.speed.air.x.limit;
    if (shouldAllowAirXControl) {
      const multiplier = this.recentlyWallJumped ? 0.65 : 1;
      this.sprite.applyForce(new Phaser.Math.Vector2(this.speed.air.x.accel * multiplier * xDir, 0));
    }

    const velX = this.sprite.body.velocity.x;
    const shouldIncreaseAirXDrag = isInAir && !leftOrRightIsPressed && Math.abs(velX) > 0.2
      && this.dashStatus != 'DASHING' && !this.affectedByJumpPad && !this.recentlyWallJumped;
    if (shouldIncreaseAirXDrag)
      this.sprite.setVelocityX(velX - this.speed.air.x.halt * Math.sign(velX));

    const shouldWallslide = isInAir && isPressingAgainstWall && this.dashStatus != 'DASHING';
    if (shouldWallslide) {
      if (this.sprite.body.velocity.y >= this.speed.wallSlide)
        this.sprite.setVelocityY(this.speed.wallSlide);
      this.sprite.anims.play(`wallslide-${xDirLabel}`, true);
      this.wallSlideSound.fadeInIfNotPlaying(300);
    }

    if (!shouldWallslide)
      this.wallSlideSound.fadeOut(200);

    if (isOnFloor)
      this.sprite.setFriction(this.speed.floor.friction);
    else // Prevent wallslide bug
      this.sprite.setFriction(0);

    const shouldWalljump = isInAir && nearWall && input.jumpIsPressed() && this.dashStatus != 'DASHING';
    if (shouldWalljump) {
      const upSpeed = this.sprite.body.velocity.y < 0
        ? this.speed.wallJump.y * -1 + (this.sprite.body.velocity.y * this.speed.wallJump.preserveUpMomentum)
        : this.speed.wallJump.y * -1;
      const awaySpeed = -this.speed.wallJump.x * nearWall;
      this.sprite.setVelocity(awaySpeed, upSpeed);
      this.recentlyWallJumped = true;
      this.scene.time.delayedCall(this.speed.wallJump.reducedAirControlMs,
        () => this.recentlyWallJumped = false);
      this.scene.sound.play('jump', {
        volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
      });
    }

    const shouldStartDash = isInAir && input.dashIsPressed() && input.anyDirectionIsPressed()
      && this.dashStatus == 'AVAILABLE' && this.touchedDownSinceLastDash && !isPressingAgainstWall;
    if (shouldStartDash) {
      this.dashStatus = 'DASHING';
      this.touchedDownSinceLastDash = false;
      this.dashXValue = xDir !== XDirection.None ? this.speed.dash.x * xDir : 0;
      this.dashYValue = input.upIsPressed() ? this.speed.dash.y * -1 : input.downIsPressed() ? this.speed.dash.y : 0;
      this.scene.cameras.main.shake(80, 0.007);
      this.trail.emitting = true;
      this.sprite.setIgnoreGravity(true);
      this.scene.sound.play('jump', {
        volume: randomInRange(7, 9) / 10, detune: randomInRange(210, 380)
      });

      this.scene.time.delayedCall(this.speed.dash.durationMs, () => {
        this.dashStatus = 'RECHARGING';
        this.dashXValue = this.dashYValue = 0;
        this.trail.emitting = false;
        this.sprite.setIgnoreGravity(false);
        this.sprite.setVelocityX(this.sprite.body.velocity.x * this.speed.dash.endBoost);
        this.sprite.setVelocityY(this.sprite.body.velocity.y * this.speed.dash.endBoost);
      });

      this.scene.time.delayedCall(this.speed.dash.durationMs + this.speed.dash.cooldownMs,
        () => this.dashStatus = 'AVAILABLE');
    }

    if (this.dashStatus == 'DASHING')
      this.sprite.setVelocity(this.dashXValue, this.dashYValue);

    const shouldResetDashAbility = !this.touchedDownSinceLastDash && this.dashStatus != 'DASHING'
      && (isOnFloor || shouldWallslide || shouldWalljump);
    if (shouldResetDashAbility)
      this.touchedDownSinceLastDash = true;

    const shouldLimitFall = isInAir && this.sprite.body.velocity.y > this.speed.air.fall.max;
    if (shouldLimitFall)
      this.sprite.setVelocityY(this.speed.air.fall.max);

    // const shouldBoostFall = !input.jumpIsPressed() && !isPressingAgainstWall
    //   && this.sprite.body.velocity.y.inRange(this.speed.y.air.fall.boostBetween.min, this.speed.y.air.fall.boostBetween.max);
    // if (shouldBoostFall)
    //   this.sprite.applyForce(new Phaser.Math.Vector2(0, this.speed.y.air.fall.boostBetween.force));

    const shouldEndJumpEarly = this.isJumping && !input.jumpIsPressed()
      && this.sprite.body.velocity.y < -0.01 && this.dashStatus != 'DASHING';
    if (shouldEndJumpEarly)
      this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.9);

    // const isAtPeakOfJump = isInAir && isInRange(this.sprite.body.velocity.y, -1, 1); //&& input.jumpIsPressed();
    // if (isAtPeakOfJump && !this.hasReducedGravity) {
    //   this.hasReducedGravity = true;
    //   this.scene.time.delayedCall(350, () => this.hasReducedGravity = false);
    // }
    // if (this.hasReducedGravity)
    //   this.sprite.applyForce(new Phaser.Math.Vector2(0, -0.0003));

    console.log(`velX: ${this.sprite.body.velocity.x.toFixed(2).replace('-0.00', '0.00')}`
      + ` | velY ${this.sprite.body.velocity.y.toFixed(2).replace('-0.00', '0.00')}`
      + ` | onFloor: ${isOnFloor}`);
  }

  damage(amount: number) {
    if (amount > 5)
      this.scene.cameras.main.shake(100, 0.04);
    this.health -= amount;
    (this.scene as GameScene).healthBar.setLevel(this.health);
  }

  hitJumpPad(newVel: { x: number; y: number; }) {
    this.affectedByJumpPad = true;
    this.touchedDownSinceLastDash = true;
    this.sprite.setVelocity(newVel.x, newVel.y);
    this.scene.time.delayedCall(1000, () => this.affectedByJumpPad = false);
  }

  private playRunningSound() {
    if (this.scene.sound.isPlaying('running')) return;
    const stepCount = 19;
    const stepLengthMs = 294;
    const randomStep = randomInRange(0, stepCount - 1);
    const randomStartTimeSeconds = randomStep * stepLengthMs / 1000;
    this.scene.sound.play('running', { volume: 0.6, loop: true, seek: randomStartTimeSeconds });
  }

  private createPhysicsBody() {
    const BodyModule = this.scene.matter.body;
    const BodiesModule = this.scene.matter.bodies;

    const { width: w, height: h } = this.sprite;
    const middleBodyWidth = w * 0.9;
    const middleBody = BodiesModule.rectangle(0, 0, middleBodyWidth, h, {
      chamfer: { radius: 8 },
      label: 'player'
    });

    const sensor = {
      bottom: {
        w: w * 0.5,
        h: 4
      },
      side: {
        w: 2,
        h: h * 0.3
      }
    };

    this.sensors = {
      bottom: BodiesModule.rectangle(0, h / 2 + (sensor.bottom.h / 2), sensor.bottom.w, sensor.bottom.h, { isSensor: true }),
      left: BodiesModule.rectangle(-middleBodyWidth / 2 - (sensor.side.w / 2), 0, sensor.side.w, sensor.side.h, { isSensor: true }),
      right: BodiesModule.rectangle(middleBodyWidth / 2 + (sensor.side.w / 2), 0, sensor.side.w, sensor.side.h, { isSensor: true })
    };

    const compoundBody = BodyModule.create({
      parts: [middleBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
      frictionStatic: 0.2,
      frictionAir: this.speed.air.resistance,
      friction: this.speed.floor.friction,
      render: { sprite: { xOffset: 0.5, yOffset: 0.5 } },
      restitution: 0.06
      //density: 0.1
      //mass: 0.844
      //gravityScale: { x: 0.01, y: 0.01 }
      //slop: 0.04
    });

    this.sprite.setExistingBody(compoundBody);

    this.touching = { left: false, right: false, bottom: false };
    this.scene.matter.world.on('beforeupdate', (event) => {
      this.touching = { left: false, right: false, bottom: false };
    });
    this.scene.matter.world.on('collisionactive', (event) => {
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA === middleBody || bodyB === middleBody)
          continue;
        else if ((bodyA === this.sensors.bottom && !bodyB.isSensor) || (bodyB === this.sensors.bottom && !bodyA.isSensor))
          this.touching.bottom = true;
        // L/R should not be blocked by pushable objects, only static objects.
        else if ((bodyA === this.sensors.left && bodyB.isStatic && !bodyB.isSensor) || (bodyB === this.sensors.left && bodyA.isStatic && !bodyA.isSensor))
          this.touching.left = true;
        else if ((bodyA === this.sensors.right && bodyB.isStatic && !bodyB.isSensor) || (bodyB === this.sensors.right && bodyA.isStatic && !bodyA.isSensor))
          this.touching.right = true;
      }
    });
  }

  private createAnimations() {
    this.scene.anims.createUnique({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.scene.anims.createUnique({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 8,
      repeat: -1
    });
    this.scene.anims.createUnique({
      key: 'turn',
      frames: [{ key: 'player', frame: 4 }]
    });
    this.scene.anims.createUnique({
      key: 'wallslide-left',
      frames: [{ key: 'player', frame: 10 }]
    });
    this.scene.anims.createUnique({
      key: 'wallslide-right',
      frames: [{ key: 'player', frame: 9 }]
    });
  }

  cleanUpOnMapEnd() {
    this.sprite.anims.pause();
    this.scene.sound.stopByKey('running');
    //this.trail.emitting = false;
  }
}
