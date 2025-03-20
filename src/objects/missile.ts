import { GameScene } from '../scenes/game-scene';
import { Player } from './player';

export class Missile extends Phaser.Physics.Matter.Image {
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private speed = 2.4;
  private turnDegreesPerFrameLimit = 1.18;
  private imageSize = 0.14;
  private damage = 95;
  // [old] originatingTurret? : MissileTurret;

  constructor(scene: GameScene, x: number, y: number, player: Player) {
    super(scene.matter.world, x, y, 'missile');

    this.setIgnoreGravity(true);
    this.setScale(this.imageSize);

    scene.collisionPlugin.addOnCollideStart({
      objectA: this,
      callback: (event) => {
        if (event.bodyB.isSensor) return;
        this.hitSomething();
      }
    });

    scene.collisionPlugin.addOnCollideStart({
      objectA: this,
      objectB: player.sprite,
      callback: (event) => {
        this.hitPlayer(player);
      }
    });

    if (player) {
      this.setRotation(
        this.getTargetRotation(player.sprite.x, player.sprite.y)
      );
    }

    scene.add.existing(this);

    // TODO: Position to back of missile, not center
    // https://docs.phaser.io/phaser/concepts/gameobjects/container
    this.trail = this.scene.add.particles(50, 50, 'flares', {
      frame: 'white',
      color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
      colorEase: 'quad.out',
      lifespan: 1500,
      angle: { min: 170, max: 190 },
      scale: { start: 0.15, end: 0, ease: 'sine.out' },
      speed: 100,
      blendMode: 'ADD',
      alpha: 0.5
    });
  }

  hitSomething() {
    const explosion = this.scene.add.particles(this.x, this.y, 'explosion', {
      lifespan: { min: 70, max: 350 },
      speed: { min: 100, max: 600 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      angle: { min: 0, max: 360 },
      color: [0xffffff, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404]
    });
    explosion.explode(35);
    this.scene.sound.play('explosion', { volume: 0.6 });
    this.trail.destroy();
    this.destroy();
  }

  hitPlayer(player: Player) {
    player.damage(this.damage);
  }

  override update(targetX: number, targetY: number) {
    const targetRotation = this.getTargetRotation(targetX, targetY);
    this.rotateWithLimit(targetRotation, this.turnDegreesPerFrameLimit);
    this.trail.setX(this.x);
    this.trail.setY(this.y);
    this.trail.setAngle(Phaser.Math.RadToDeg(this.rotation));
    this.moveForwards(this.speed);
  }

  private getTargetRotation(targetX: number, targetY: number) {
    return Phaser.Math.Angle.Between(
      this.x, this.y,
      targetX, targetY
    );
  }

  private moveForwards(speed: number) {
    this.setVelocityX(Math.cos(this.rotation) * speed);
    this.setVelocityY(Math.sin(this.rotation) * speed);
  }

  private rotateWithLimit(targetRotation: number, limit: number) {
    const difference = Phaser.Math.Angle.Wrap(targetRotation - this.rotation);

    if (Math.abs(difference) < Phaser.Math.DegToRad(limit)) { // If difference is less than how much we can turn...
      this.rotation = targetRotation; // Face target
    }
    else { // If difference is greater than how much we can turn in one frame...
      if (difference > 0) { // And difference is positive...
        this.setAngle(this.angle + limit); // Rotate clockwise
      }
      else { // And difference is negative...
        this.setAngle(this.angle - limit); // Rotate anticlockwise
      }
    }
  }
}
