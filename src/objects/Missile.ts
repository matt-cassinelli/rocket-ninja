export class Missile extends Phaser.Physics.Arcade.Image {
  private SPEED = 119;
  private TURN_DEGREES_PER_FRAME = 1.18;
  private IMAGE_SIZE = 0.14;
  private HIT_BOX_SIZE = 70;
  // [idea] body: Phaser.Physics.Arcade.Body;
  // [old] originatingTurret? : MissileTurret;

  constructor(scene: Phaser.Scene, x: number, y: number, initialTargetX?: number, initialTargetY?: number /* [old], originatingTurret?:MissileTurret */) {
    // Ideally I would keep a reference of our Player in this class. Using update() method for now instead
    super(scene, x, y, 'missile');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.addToDisplayList();
    this.scale = this.IMAGE_SIZE;
    this.body.setCircle(
      this.HIT_BOX_SIZE,
      (-this.HIT_BOX_SIZE + this.width / 2),
      (-this.HIT_BOX_SIZE + this.height / 2)
    );

    if (initialTargetX !== undefined && initialTargetY !== undefined) {
      this.setRotation(
        this.getTargetRotation(initialTargetX, initialTargetY)
      );
    }
  }

  update(targetX: number, targetY: number) {
    // [if using reference] const target = this.target
    const targetRotation = this.getTargetRotation(targetX, targetY);
    this.rotateWithLimit(targetRotation, this.TURN_DEGREES_PER_FRAME);
    this.moveForwards(this.SPEED); // [todo] adjust speed based on distance to player?
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
      if (difference > 0) { // If difference is positive...
        this.setAngle(this.angle + limit); // Rotate clockwise
      }
      else { // If difference is negative...
        this.setAngle(this.angle - limit); // Rotate anticlockwise
      }
    }
  }

  explode() {
    const particles = this.scene.add.particles(
      this.x,
      this.y,
      'explosion',
      {
        lifespan: { min: 50, max: 300 },
        speed: { min: 100, max: 600 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 1, end: 0 }
      }
    );
    particles.explode(30);
    this.destroy();
  }
}
