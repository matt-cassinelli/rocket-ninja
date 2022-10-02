export class Missile extends Phaser.Physics.Arcade.Image
{
    private SPEED: number = 119;
	private TURN_DEGREES_PER_FRAME = 1.18;
	private IMAGE_SIZE: number = 0.15;
	private HIT_BOX_SIZE = 70;

	constructor(scene:Phaser.Scene, x:number, y:number) 
	{ // [todo] keep a reference of the player instance in this class instead of using the update() method?
		super(scene, x, y, 'missile')
		this.scene = scene;
		scene.physics.add.existing(this)
		this.addToDisplayList();
		this.scale = this.IMAGE_SIZE;
		// this.HIT_BOX_SIZE = this.scale
		this.body.setCircle(
			this.HIT_BOX_SIZE,
			(-this.HIT_BOX_SIZE + this.width / 2),
			(-this.HIT_BOX_SIZE + this.height / 2)
		);
	}

	update(targetX:number, targetY:number)
	{
		//const target = this.target
		const targetRotation = Phaser.Math.Angle.Between(
			this.x, this.y,
			targetX, targetY
		)
		this.rotateWithLimit(targetRotation, this.TURN_DEGREES_PER_FRAME)
		this.moveForwards(this.SPEED) // [todo] adjust speed based on distance to player?
	}

	moveForwards(speed: number)
	{
		this.body.velocity.x = Math.cos(this.rotation) * speed
		this.body.velocity.y = Math.sin(this.rotation) * speed
	}

	rotateWithLimit(targetRotation: number, limit: number)
	{
		let difference = Phaser.Math.Angle.Wrap(targetRotation - this.rotation)
	
		if (Math.abs(difference) < Phaser.Math.DegToRad(this.TURN_DEGREES_PER_FRAME)) // If difference is less than how much we can turn
		{
			this.rotation = targetRotation; // Face target
		}
		else // If difference is greater than how much we can turn in one frame
		{
			if (difference > 0) // If difference is positive
			{
				this.setAngle(this.angle + this.TURN_DEGREES_PER_FRAME) // Rotate clockwise
			}
			else // If difference is negative
			{
				this.setAngle(this.angle - this.TURN_DEGREES_PER_FRAME) // Rotate anticlockwise
			}
		}

	}
}