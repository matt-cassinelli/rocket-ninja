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
  private dashStatus: 'DASHING' | 'RECHARGING' | 'AVAILABLE';
  private touchedDownSinceLastDash: boolean;
  private dashXValue: number;
  private dashYValue: number;
  private isJumping: boolean;
  private timeInAir: number;
  private affectedByJumpPad: boolean;
  private recentlyWallJumped: boolean;
  private dashTrail: Phaser.GameObjects.Particles.ParticleEmitter;
  private squashTween: Phaser.Tweens.Tween;
  private wallSlideSound: SoundFader;
  private speed = {
    floor: {
      run: 5.5,
      jump: 10.6,
      coyote: 175,
      friction: 0.4
    },
    air: {
      x: {
        accel: 0.0017,
        limit: 5.5,
        halt: 0.16
      },
      fall: {
        max: 11.7
      },
      resistance: 0.011
    },
    dash: {
      x: 11.5,
      y: 8,
      endBoost: 0.55,
      durationMs: 250,
      cooldownMs: 550
    },
    wallJump: {
      x: 7.3,
      y: 7,
      preserveUpMomentum: 0.53,
      reducedAirControlMs: 290
    },
    wallSlide: 0.15
  };

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    this.scene = scene;

    this.createSpriteAndPhysicsBody(object.x, object.y);
    this.createAnimations();

    this.dashStatus = 'AVAILABLE';
    this.touchedDownSinceLastDash = true;
    this.wallSlideSound = new SoundFader(scene, 'wall-slide', 0.25);

    this.dashTrail = this.scene.add.particles(0, 0, 'cloud-white', {
      scale: { start: 0.29, end: 0.15 },
      rotate: { min: 0, max: 360 },
      speed: { min: 2, max: 5 },
      alpha: { start: 0.07, end: 0, ease: 'quint.out' },
      lifespan: { min: 3700, max: 3900 },
      frequency: 5,
      blendMode: Phaser.BlendModes.OVERLAY,
      follow: this.sprite,
      emitting: false
    });
    this.dashTrail.setDepth(1);

    this.squashTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: this.sprite.scaleX * 0.85,
      yoyo: true,
      duration: 200,
      paused: true,
      persist: true
    });
  }

  move(input: InputHandler, time: number, delta: number) {
    const xDir = input.getXDirection();
    const leftOrRightIsPressed = xDir !== XDirection.None;
    const isOnFloor = this.touching.bottom;
    const isInAir = !isOnFloor;
    const nearWall = this.touching.right ? XDirection.Right : this.touching.left ? XDirection.Left : null;
    const isPressingAgainstWall = xDir == nearWall;
    const shouldWallslide = isInAir && isPressingAgainstWall && this.dashStatus != 'DASHING';

    if (xDir == XDirection.Left)
      this.sprite.setFlipX(true);

    if (xDir == XDirection.Right)
      this.sprite.setFlipX(false);

    if (isOnFloor && leftOrRightIsPressed && !shouldWallslide)
      this.sprite.anims.play('run', true);

    if (!leftOrRightIsPressed && this.dashStatus != 'DASHING')
      this.sprite.anims.play('idle', true);

    if (isOnFloor || isPressingAgainstWall || this.dashStatus == 'DASHING' || this.affectedByJumpPad)
      this.isJumping = false;

    if (isOnFloor && leftOrRightIsPressed && !this.affectedByJumpPad) {
      this.sprite.setVelocityX(this.speed.floor.run * xDir);
      this.playRunningSound();
    }

    if (isInAir && this.dashStatus != 'DASHING') {
      const velY = this.sprite.body.velocity.y;
      const animKey = velY < 0 ? 'air-rise' : velY < 6 ? 'air-mid' : 'air-fall';
      this.sprite.anims.play(animKey, true);
    }

    if (isInAir || !leftOrRightIsPressed)
      this.scene.sound.stopByKey('running');

    this.timeInAir = isOnFloor ? 0 : this.timeInAir + delta;
    const shouldJump = this.timeInAir < this.speed.floor.coyote
      && input.jumpIsPressed() && this.dashStatus != 'DASHING' && !this.isJumping;
    if (shouldJump) {
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
    const shouldIncreaseAirXDrag = isInAir && !leftOrRightIsPressed && Math.abs(velX) > 0.01
      && this.dashStatus != 'DASHING' && !this.affectedByJumpPad && !this.recentlyWallJumped;
    if (shouldIncreaseAirXDrag)
      this.sprite.setVelocityX(velX - this.speed.air.x.halt * Math.sign(velX));

    if (shouldWallslide) {
      if (this.sprite.body.velocity.y >= this.speed.wallSlide)
        this.sprite.setVelocityY(this.speed.wallSlide);
      this.sprite.anims.play('wallslide', true);
      this.wallSlideSound.fadeInIfNotPlaying(300);
    }

    if (!shouldWallslide)
      this.wallSlideSound.fadeOut(200);

    // Prevent sticking to wall when not wallsliding.
    const friction = isOnFloor ? this.speed.floor.friction : 0;
    this.sprite.setFriction(friction);

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
      this.dashTrail.emitting = true;
      this.sprite.setIgnoreGravity(true);
      this.scene.sound.play('jump', {
        volume: randomInRange(7, 9) / 10, detune: randomInRange(210, 380)
      });

      this.scene.time.delayedCall(this.speed.dash.durationMs, () => {
        this.dashStatus = 'RECHARGING';
        this.dashXValue = this.dashYValue = 0;
        this.dashTrail.emitting = false;
        this.sprite.setIgnoreGravity(false);
        this.sprite.setVelocityX(this.sprite.body.velocity.x * this.speed.dash.endBoost);
        this.sprite.setVelocityY(this.sprite.body.velocity.y * this.speed.dash.endBoost);
      });

      this.scene.time.delayedCall(this.speed.dash.durationMs + this.speed.dash.cooldownMs,
        () => this.dashStatus = 'AVAILABLE');
    }

    if (this.dashStatus == 'DASHING') {
      this.sprite.setVelocity(this.dashXValue, this.dashYValue);
      this.sprite.anims.play('dash', true);
    }

    const shouldResetDashAbility = !this.touchedDownSinceLastDash && this.dashStatus != 'DASHING'
      && (isOnFloor || shouldWallslide || shouldWalljump);
    if (shouldResetDashAbility)
      this.touchedDownSinceLastDash = true;

    const shouldLimitFall = isInAir && this.sprite.body.velocity.y > this.speed.air.fall.max;
    if (shouldLimitFall)
      this.sprite.setVelocityY(this.speed.air.fall.max);

    const shouldEndJumpEarly = this.isJumping && !input.jumpIsPressed()
      && this.sprite.body.velocity.y < -0.01 && this.dashStatus != 'DASHING';
    if (shouldEndJumpEarly)
      this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.9);

    // console.log(`velX: ${this.sprite.body.velocity.x.toFixed(2).replace('-0.00', '0.00')}`
    //   + ` | velY ${this.sprite.body.velocity.y.toFixed(2).replace('-0.00', '0.00')}`
    //   + ` | onFloor: ${isOnFloor}`
    //   + ` | airTime: ${this.timeInAir.toFixed(0)}`);
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

  private createSpriteAndPhysicsBody(originX: number, originY: number) {
    this.sprite = this.scene.matter.add.sprite(originX, originY, 'player', 0);
    const BodyModule = this.scene.matter.body;
    const BodiesModule = this.scene.matter.bodies;
    const { width: spriteW, height: spriteH } = this.sprite;
    const bodyW = spriteW * 0.22;
    const bodyH = spriteH * 0.55;
    const body = BodiesModule.rectangle(0, 0, bodyW, bodyH, {
      chamfer: { radius: 6 },
      label: 'player-body'
    });

    const sensors = {
      bottom: {
        w: bodyW * 0.65,
        h: 4
      },
      side: {
        w: 2,
        h: bodyH * 0.3
      }
    };

    this.sensors = {
      bottom: BodiesModule.rectangle(0, bodyH / 2 + (sensors.bottom.h / 2), sensors.bottom.w, sensors.bottom.h, { isSensor: true }),
      left: BodiesModule.rectangle(-bodyW / 2 - (sensors.side.w / 2), 0, sensors.side.w, sensors.side.h, { isSensor: true }),
      right: BodiesModule.rectangle(bodyW / 2 + (sensors.side.w / 2), 0, sensors.side.w, sensors.side.h, { isSensor: true })
    };

    const compoundBody = BodyModule.create({
      parts: [body, this.sensors.bottom, this.sensors.left, this.sensors.right],
      frictionStatic: 0.2,
      frictionAir: this.speed.air.resistance,
      friction: this.speed.floor.friction,
      restitution: 0.07
      //density: 0.1
      //mass: 0.844
      //gravityScale: { x: 0.01, y: 0.01 }
      //slop: 0.04
    });

    this.sprite
      .setExistingBody(compoundBody)
      .setFixedRotation()
      .setScale(1.35)
      .setOrigin(0.5, 0.75)
      .setPosition(originX, originY)
      .setDepth(2);

    this.touching = { left: false, right: false, bottom: false };
    this.scene.matter.world.on('beforeupdate', (event) => {
      this.touching = { left: false, right: false, bottom: false };
    });
    this.scene.matter.world.on('collisionactive', (event) => {
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA === body || bodyB === body)
          continue;
        else if ((bodyA === this.sensors.bottom && !bodyB.isSensor) || (bodyB === this.sensors.bottom && !bodyA.isSensor))
          this.touching.bottom = true;
        else if ((bodyA === this.sensors.left && bodyB.isStatic && !bodyB.isSensor) || (bodyB === this.sensors.left && bodyA.isStatic && !bodyA.isSensor))
          this.touching.left = true;
        else if ((bodyA === this.sensors.right && bodyB.isStatic && !bodyB.isSensor) || (bodyB === this.sensors.right && bodyA.isStatic && !bodyA.isSensor))
          this.touching.right = true;
      }
    });
  }

  private createAnimations() {
    const key = 'player';
    this.scene.anims.createUnique({
      key: 'run',
      frames: this.scene.anims.generateFrameNumbers(key, { start: 7, end: 14 }),
      frameRate: 14,
      repeat: -1
    });
    this.scene.anims.createUnique({
      key: 'idle',
      frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 6 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.createUnique({
      key: 'air-rise',
      frames: [{ key: key, frame: 18 }]
    });
    this.scene.anims.createUnique({
      key: 'air-mid',
      frames: [{ key: key, frame: 19 }]
    });
    this.scene.anims.createUnique({
      key: 'air-fall',
      frames: [{ key: key, frame: 20 }]
    });
    this.scene.anims.createUnique({
      key: 'wallslide',
      frames: this.scene.anims.generateFrameNumbers(key, { start: 55, end: 60 }),
      frameRate: 12,
      repeat: -1
    });
    this.scene.anims.createUnique({
      key: 'dash',
      frames: [24, 25, 26, 27, 28, 29, 30]
        .map((f) => { return { key: key, frame: f }; }),
      frameRate: 10
    });
  }

  cleanUpOnMapEnd() {
    this.sprite.anims.pause();
    this.scene.sound.stopByKey('running');
  }
}
