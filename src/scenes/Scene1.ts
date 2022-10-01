import { Physics } from "phaser"
import { InputHandler } from "../helpers/InputHandler"
import { Player } from '../objects/Player'
import { Coin } from '../objects/Coin'

export class Scene1 extends Phaser.Scene {

  //private platforms?: Phaser.Physics.Arcade.StaticGroup
  private platformLayer!: Phaser.Tilemaps.TilemapLayer // ! or ? is needed to assure TS this will be created, even though it's not in constructor.
                                                   // Phaser uses preload() and create() for construction instead.
  private coinGroup!: Phaser.Physics.Arcade.StaticGroup
  private bombs?: Phaser.Physics.Arcade.Group
  private player?: Player
  private inputHandler!: InputHandler;
  private score: number = 0
  private scoreText?: Phaser.GameObjects.Text // [todo] Move these to the constructor or create().
  private map!: Phaser.Tilemaps.Tilemap;

  constructor() {
    super('Scene1')
  }

  preload() {
    // this.load.image('background', 'sky.png')
    this.load.image('ground',     'platform.png')
    this.load.image('coin',       'coin.png')
    this.load.image('bomb',       'bomb.png')
    this.load.image('aura',       'aura-black.png')
    this.load.image('tile-solid', 'tile-solid.png');
    this.load.tilemapTiledJSON(
      "map",
      "map.json",
    );
    this.load.spritesheet(
      'player', // Spritesheets contain frames for animations.
      'player-black-29x37.png',
      {frameWidth: 29, frameHeight: 37}
    );
  }

  createPlatforms() {
    this.map = this.make.tilemap({key: 'map'})
    //this.map = this.add.tilemap("map");
    this.map.addTilesetImage("tileset01", "tile-solid");
    this.map.setCollision(1);
    this.platformLayer = this.map.createLayer("solid-layer", "tileset01");
    // this.platforms.
  }

  createCoins() {
    //this.map.filterObjects('object-layer', o => o.name === 'coin')
    this.coinGroup = this.physics.add.staticGroup({});
    this.coinGroup.addMultiple( // @ts-ignore https://phaser.discourse.group/t/10239/3
      this.map.createFromObjects('object-layer', {name:'coin', key: 'coin', classType: Coin}) // [todo] Change Layer name in Tiled editor
    )
    //   const coins: Coin[] = <Coin[]>this.map.createFromObjects('coin-layer', {
    //     name: 'player1', // @ts-ignore
    //     classType: Coin
    // });
    // Phaser.Tilemaps.ObjectLayer
  }

  create() {
    this.inputHandler = new InputHandler(this)

    // this.add.image(
    //   this.game.config.width as number / 2,
    //   this.game.config.height as number /2,
    //   'background'
    // )

    this.scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', color:'#000'})
    

    //this.add.existing(player)

    this.createPlatforms();

    const playerTiledObject: Phaser.Types.Tilemaps.TiledObject =
      this.map.findObject('object-layer', o => o.name === 'player') // Bug: This is returning default(?) coords.
    this.player = new Player(this, playerTiledObject.x!, playerTiledObject.y!) // 100, 350

    this.physics.add.collider(this.player, this.platformLayer) // The player should collide with platforms.

    this.createCoins();
    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      this.handleCollectCoin,
      undefined,
      this
    )

    this.bombs = this.physics.add.group() // [todo] Place according to tilemap.
    this.physics.add.collider(this.bombs, this.platformLayer)
    this.physics.add.collider(this.player, this.bombs, this.player.die, undefined, this.player)
  }

  private handleCollectCoin(player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject) {
    coin.destroy()
    // (coin as Coin).collect
    this.score += (<Coin>coin).value // Unfortunately we need to cast because Phaser won't accept custom types as arguments here...
    this.scoreText?.setText(`score: ${this.score}`)
    // [todo] Add sound fx.
  }

  // private createBouncingBombs() {
  //     if (this.player) {
  //       const pos = this.player.x < 400 // [todo] use screen width, not hard coded number.
  //         ? Phaser.Math.Between(400, 800) // If the player is on the left side, bomb will go somewhere on the right side
  //         : Phaser.Math.Between(0, 400) // else if the player is on the right side, bomb goes on the left side
  //       const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(pos, 16, 'bomb')
  //       bomb.setBounce(1)
  //       bomb.setCollideWorldBounds(true)
  //       bomb.setVelocityY(Phaser.Math.Between(-200, 200))
  //     }
  // }

  update() {
    this.inputHandler.update();
    this.player?.update(this.inputHandler);
    if (this.player?.isDead) {
      this.physics.pause()
      this.time.addEvent({
        delay: 1500,
        callback: () => this.scene.restart()
      })
    }
  }
}