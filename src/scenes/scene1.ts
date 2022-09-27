import { Physics } from "phaser"
import { Player } from '../objects/player'

export class Scene1 extends Phaser.Scene {

  private platforms?: Phaser.Physics.Arcade.StaticGroup // "?" means it could be undefined.
  private gold?: Phaser.Physics.Arcade.Group
  private bombs?: Phaser.Physics.Arcade.Group
  //private player?: Phaser.Physics.Arcade.Sprite
  private player?: Player
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score: number = 0
  private scoreText?: Phaser.GameObjects.Text // [todo] Move these to the constructor or create().
  //private gameOver = false

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

  createPlatforms() {
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    platforms.create(50,  250, 'ground')
    platforms.create(600, 400, 'ground')
    platforms.create(750, 220, 'ground')
    return platforms
  }

  create() {
    this.add.image(400, 300, 'background')
    
    this.platforms = this.createPlatforms();

    this.player = new Player(this, 100, 450)

    this.physics.add.collider(this.player, this.platforms) // The player should collide with platforms.

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
    this.physics.add.collider(this.player, this.bombs, this.player.kill, undefined, this.player)

    this.cursors = this.input.keyboard.createCursorKeys()
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

  update() {
    this.player?.update(this.cursors)
    if (this.player?.isDead) {
      this.physics.pause()
      this.time.addEvent({
        delay: 1500,
        callback: () => this.scene.restart()
      })
      //this.gameOver = true // What's the use in this?
    }
  }
}