export class Scene1 extends Phaser.Scene {

  private platforms? : Phaser.Physics.Arcade.StaticGroup
  private player? : Phaser.Physics.Arcade.Sprite

  constructor() {
    super('Scene1');
  }

  preload() {
    this.load.image('background', 'images/sky.png')
    this.load.image('ground',     'images/platform.png');
    this.load.image('star',       'images/star.png');
    this.load.image('bomb',       'images/bomb.png');
    this.load.spritesheet(
      'dude', // spritesheets contain frames for animations
      'images/dude.png',
      {frameWidth: 32, frameHeight: 48}
    );
  }

  create() {
    this.add.image(400, 300, 'background')
    
    this.platforms = this.physics.add.staticGroup();
    // const ground = this.platforms.create(400, 568, 'ground') as Phaser.Physics.Arcade.Image
    // ground.setScale(2).refreshBody()
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    this.platforms.create(50,  250, 'ground')
    this.platforms.create(600, 400, 'ground')
    this.platforms.create(750, 220, 'ground')

    this.player = this.physics.add.sprite(100, 450, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true) // Can't go off screen.

    this.physics.add.collider(this.player, this.platforms)

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
      frameRate: 10,
      repeat: -1 // Infinity (loop forever).
    })

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4} ],
      frameRate: 20
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
      frameRate: 10,
      repeat: -1
    })
  }

  update() {
  }
  
}