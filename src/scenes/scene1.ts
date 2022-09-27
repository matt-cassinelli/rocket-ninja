import { Physics } from "phaser"

export class Scene1 extends Phaser.Scene {

  private platforms?: Phaser.Physics.Arcade.StaticGroup // "?" means it could be undefined.
  private gold?: Phaser.Physics.Arcade.Group
  private bombs?: Phaser.Physics.Arcade.Group
  private player?: Phaser.Physics.Arcade.Sprite
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score: number = 0
  private scoreText?: Phaser.GameObjects.Text // [todo] Move these to the constructor or create().
  private gameOver = false

  constructor() {
    super('Scene1')
  }

  preload() {
    this.load.image('background', 'sky.png')
    this.load.image('ground',     'platform.png')
    this.load.image('gold',       'gold.png')
    this.load.image('bomb',       'bomb.png')
    this.load.spritesheet(
      'dude', // Spritesheets contain frames for animations.
      'dude.png',
      {frameWidth: 32, frameHeight: 48}
    )
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

    //            this.add.sprite // Non-physics version
    this.player = this.physics.add.sprite(100, 450, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true) // The player should not leave the screen.

    this.physics.add.collider(this.player, this.platforms) // The player should collide with platforms.

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
      frameRate: 10,
      repeat: -1 // Loop forever.
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

    this.cursors = this.input.keyboard.createCursorKeys()

    this.gold = this.physics.add.group({
      key: 'gold',
      repeat: 11,
      setXY: { x:12, y:0, stepX:70 },
    })

    this.gold.children.iterate(c => {
      const child = c as Phaser.Physics.Arcade.Image
      child.scale = 2
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

    this.physics.add.collider(this.gold, this.platforms)
    this.physics.add.overlap(this.player, this.gold, this.handleCollectGold, undefined, this)

    this.scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', color:'#000'}) // Show text.

    this.bombs = this.physics.add.group()
    this.physics.add.collider(this.bombs, this.platforms)
    this.physics.add.collider(this.player, this.bombs, this.handleHitBomb, undefined, this)
  }

  private handleCollectGold(player: Phaser.GameObjects.GameObject, gold: Phaser.GameObjects.GameObject) {
    const g = gold as Phaser.Physics.Arcade.Image // Casting.
    g.disableBody(true, true) // Hide the gold you collided with.
    this.score += 10
    this.scoreText?.setText(`score: ${this.score}`)
    // [todo] Add sound fx.

    if (this.gold?.countActive() === 0) {
      this.gold.children.iterate(c => {
        const child = c as Phaser.Physics.Arcade.Image
        child.enableBody(true, child.x, 0, true, true)
      })

      if (this.player) {
        const x = this.player.x < 400
          ? Phaser.Math.Between(400, 800) // If the player is on the left side, bomb will go somewhere on the right side
          : Phaser.Math.Between(0, 400) // else if the player is on the right side, bomb goes on the left side

        const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocityY(Phaser.Math.Between(-200, 200))
      }
    }
  }

  private handleHitBomb(player: Phaser.GameObjects.GameObject, bomb: Phaser.GameObjects.GameObject) {
    this.physics.pause() // this should be a kill method inside Player
    this.player?.setTint(0xff0000)
    this.player?.anims.play('turn')
    this.gameOver = true
  }

  update() {
    if (!this.cursors) { // Nothing being pressed
      return
    }

    if (this.cursors.left?.isDown) { // Optional chaining (sometimes a cursor is undefined)
      this.player?.setVelocityX(-160)
      this.player?.anims.play('left', true)
    }
    else if (this.cursors.right?.isDown) {
      this.player?.setVelocityX(160)
      this.player?.anims.play('right', true)
    }
    else {
      this.player?.setVelocityX(0)
      this.player?.anims.play('turn', true)
    }

    if (this.cursors.up?.isDown && this.player?.body.touching.down) {
      this.player.setVelocityY(-330) // Jump.
    }
  }
}