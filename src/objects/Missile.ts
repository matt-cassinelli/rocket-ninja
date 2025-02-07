export class Missile extends Phaser.Physics.Arcade.Image {
  trail: Phaser.GameObjects.Particles.ParticleEmitter;
  speed = 119;
  turnDegreesPerFrameLimit = 1.18;
  imageSize = 0.14;
  hitBoxSize = 70;
  damage = 70;
  // [old] originatingTurret? : MissileTurret;

  constructor(scene: Phaser.Scene, x: number, y: number, initialTargetX?: number, initialTargetY?: number) {
    super(scene, x, y, 'missile');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.addToDisplayList();
    this.scale = this.imageSize;
    this.body.setCircle(
      this.hitBoxSize,
      (-this.hitBoxSize + this.width / 2),
      (-this.hitBoxSize + this.height / 2)
    );

    if (initialTargetX !== undefined && initialTargetY !== undefined) {
      this.setRotation(
        this.getTargetRotation(initialTargetX, initialTargetY)
      );
    }

    // TODO: Position to back of missile, not center
    this.trail = this.scene.add.particles(50, 50, 'flares', {
      //radial: false,
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

  update(targetX: number, targetY: number) {
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
    this.body.velocity.x = Math.cos(this.rotation) * speed;
    this.body.velocity.y = Math.sin(this.rotation) * speed;
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

  explode() {
    const particles = this.scene.add.particles(this.x, this.y, 'explosion', {
      lifespan: { min: 50, max: 300 },
      speed: { min: 100, max: 600 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 }
    });
    particles.explode(30);
    this.trail.destroy();
    this.destroy();
  }
}
