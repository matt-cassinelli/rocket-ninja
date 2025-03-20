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
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private wallSlideSound: SoundFader;
  private speed = {
    x: {
      floor: 5.5,
      air: {
        accel: 0.0017,
        halt: 0.16,
        limit: 5.5,
        dash: 9.7,
        endOfDashBoost: 0.55
      },
      wallJump: 7.2
    },
    y: {
      floorJump: 10.8,
      air: {
        dash: 7.5,
        endOfDashBoost: 0.55,
        fall: {
          max: 11.7
        }
      },
      wallJump: {
        force: 7,
        preserveMomentum: 0.43
      },
      wallSlide: 0.15
    },
    dashDurationMs: 295,
    dashCooldownMs: 550,
    surfaceFriction: 0.1,
    airDrag: 0.014
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
  }

  move(input: InputHandler) {
    const xDir = input.getXDirection();
    const leftOrRightIsPressed = xDir !== XDirection.None;
    const xDirLabel = leftOrRightIsPressed ? XDirection[xDir].toLowerCase() : null;
    const isOnFloor = this.touching.bottom;
    const isInAir = !isOnFloor;
    const nearWall = this.touching.right ? XDirection.Right : this.touching.left ? XDirection.Left : null;
    const isPressingAgainstWall = xDir == nearWall;

    if (leftOrRightIsPressed) {
      this.sprite.anims.play(xDirLabel, true);
    }

    if (!leftOrRightIsPressed) {
      this.sprite.anims.play('turn', true);
    }

    if (isOnFloor && !leftOrRightIsPressed && !this.affectedByJumpPad) {
      this.sprite.setVelocityX(0);
    }

    if (isOnFloor && leftOrRightIsPressed && !this.affectedByJumpPad) {
      this.sprite.setVelocityX(this.speed.x.floor * xDir);
      this.playRunningSound();
    }

    if (isInAir || !leftOrRightIsPressed) {
      this.scene.sound.stopByKey('running');
    }

    if (isOnFloor && input.jumpIsPressed() && this.dashStatus != 'DASHING') {
      this.sprite.setVelocityY(-this.speed.y.floorJump);
      this.scene.sound.play('jump', {
        volume: randomInRange(8, 10) / 10, detune: randomInRange(-120, 170)
      });
    }

    if (isInAir && leftOrRightIsPressed && this.dashStatus != 'DASHING') {
      if (xDir == 1 && this.sprite.body.velocity.x < this.speed.x.air.limit)
        this.sprite.applyForce(new Phaser.Math.Vector2(this.speed.x.air.accel * xDir, 0));

      if (xDir == -1 && this.sprite.body.velocity.x * -1 < this.speed.x.air.limit)
        this.sprite.applyForce(new Phaser.Math.Vector2(this.speed.x.air.accel * xDir, 0));
    }

    const velX = this.sprite.body.velocity.x;
    const shouldReduceMomentum = isInAir && !leftOrRightIsPressed
      && this.dashStatus != 'DASHING' && !this.affectedByJumpPad && Math.abs(velX) > 0.2;
    if (shouldReduceMomentum) {
      this.sprite.setVelocityX(velX - Math.sign(velX) * this.speed.x.air.halt);
    }

    const shouldWallslide = isInAir && isPressingAgainstWall && this.dashStatus != 'DASHING';
    if (shouldWallslide) {
      if (this.sprite.body.velocity.y >= this.speed.y.wallSlide || this.sprite.body.velocity.y < this.speed.y.wallSlide)
        this.sprite.setVelocityY(this.speed.y.wallSlide);
      this.sprite.anims.play(`wallslide-${xDirLabel}`, true);
      this.wallSlideSound.fadeInIfNotPlaying(300);
    }

    if (!shouldWallslide) {
      this.wallSlideSound.fadeOut(200);
    }

    // Prevent wallslide bug
    if (isInAir && nearWall)
      this.sprite.setFriction(0);
    else
      this.sprite.setFriction(this.speed.surfaceFriction);

    const shouldWalljump = isInAir && nearWall && input.jumpIsPressed() && this.dashStatus != 'DASHING';
    if (shouldWalljump) {
      const upSpeed = this.sprite.body.velocity.y < 0
        ? this.speed.y.wallJump.force * -1 + (this.sprite.body.velocity.y * this.speed.y.wallJump.preserveMomentum)
        : this.speed.y.wallJump.force * -1;
      const awaySpeed = -this.speed.x.wallJump * nearWall;
      this.sprite.setVelocity(awaySpeed, upSpeed);
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
      this.sprite.setIgnoreGravity(true);
      this.scene.sound.play('jump', {
        volume: randomInRange(7, 9) / 10, detune: randomInRange(210, 380)
      });

      this.scene.time.delayedCall(this.speed.dashDurationMs, () => {
        this.dashStatus = 'RECHARGING';
        this.dashXValue = this.dashYValue = 0;
        this.trail.emitting = false;
        this.sprite.setIgnoreGravity(false);
        this.sprite.setVelocityX(this.sprite.body.velocity.x * this.speed.x.air.endOfDashBoost);
        this.sprite.setVelocityY(this.sprite.body.velocity.y * this.speed.y.air.endOfDashBoost);
      });

      this.scene.time.delayedCall(this.speed.dashDurationMs + this.speed.dashCooldownMs, () => {
        this.dashStatus = 'AVAILABLE';
      });
    }

    if (this.dashStatus == 'DASHING') {
      this.sprite.setVelocity(this.dashXValue, this.dashYValue);
    }

    if (!this.touchedDownSinceLastDash && this.dashStatus != 'DASHING'
      && (isOnFloor || shouldWallslide || shouldWalljump)) {
      this.touchedDownSinceLastDash = true;
    }

    const isFallingFast = isInAir && this.sprite.body.velocity.y > this.speed.y.air.fall.max;
    if (isFallingFast)
      this.sprite.setVelocityY(this.speed.y.air.fall.max);

    // TODO: Boost fall speed immediately after pinnacle of jump?

    // console.log(`velX: ${this.sprite.body.velocity.x.toFixed(2).replace('-0.00', '0.00')}`
    //   + ` | velY ${this.sprite.body.velocity.y.toFixed(2).replace('-0.00', '0.00')}`
    //   + ` | onFloor: ${isOnFloor}`);
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
    //const originalDragX = this.speed.x.air.drag;
    //this.setDragX(0.95);
    this.scene.time.delayedCall(1000, () => {
      this.affectedByJumpPad = false;
      //this.setDragX(originalDragX);
    });
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
      chamfer: { radius: 16 },
      label: 'player'
    });
    const bottomSensorHeight = 4;
    const sideSensorWidth = 2;
    this.sensors = {
      bottom: BodiesModule.rectangle(0, h * 0.5 + (bottomSensorHeight / 2), w * 0.35, bottomSensorHeight, { isSensor: true }),
      left: BodiesModule.rectangle(-middleBodyWidth * 0.5 - (sideSensorWidth / 2), 0, sideSensorWidth, h * 0.5, { isSensor: true }),
      right: BodiesModule.rectangle(middleBodyWidth * 0.5 + (sideSensorWidth / 2), 0, sideSensorWidth, h * 0.5, { isSensor: true })
    };

    const compoundBody = BodyModule.create({
      parts: [middleBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
      frictionStatic: 0.2,
      frictionAir: this.speed.airDrag,
      friction: this.speed.surfaceFriction,
      render: { sprite: { xOffset: 0.5, yOffset: 0.5 } },
      restitution: 0.01
      //density: 0.1,
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
