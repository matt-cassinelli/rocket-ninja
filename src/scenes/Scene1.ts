import { Physics } from "phaser"
import { InputHandler } from "../helpers/InputHandler"
import { Player } from '../objects/Player'
import { Coin } from '../objects/Coin'
import { Missile } from '../objects/Missile'
import { MissileTurret } from '../objects/MissileTurret'

export class Scene1 extends Phaser.Scene
{
  private map!:                Phaser.Tilemaps.Tilemap;
  private platformLayer!:      Phaser.Tilemaps.TilemapLayer

  private inputHandler!:       InputHandler;
  private player!:             Player
  
  private coinGroup!:          Phaser.Physics.Arcade.StaticGroup
  private bombs?:              Phaser.Physics.Arcade.Group
  private missileTurretGroup!: Phaser.GameObjects.Group // private missileTurrets? //: MissileTurret[];
  private missileGroup!:       Phaser.Physics.Arcade.Group

  private score:               number = 0
  private scoreText?:          Phaser.GameObjects.Text // [todo] Move these to the constructor or create().
  private healthText!:         Phaser.GameObjects.Text

  constructor()
  {
    super('Scene1')
  }

  preload()
  {
    this.load.image('ground',         'platform.png');
    this.load.image('coin',           'coin.png');
    this.load.image('bomb',           'bomb.png');
    this.load.image('aura',           'aura-black.png');
    this.load.image('tile-solid',     'tile-solid.png');
    this.load.image('missile',        'missile.png');
    this.load.image('missile-turret', 'missile-turret.png');
    this.load.tilemapTiledJSON(
      "map",
      "map1.json",
    );
    this.load.spritesheet(
      'player', // Spritesheets contain frames for animations.
      'player-black-29x37.png',
      {frameWidth: 29, frameHeight: 37}
    );
  }

  create()
  {
    this.inputHandler = new InputHandler(this)

    this.createPlatforms();

    const playerTiledObject: Phaser.Types.Tilemaps.TiledObject =
      this.map.findObject('object-layer', o => o.name === 'player') // [todo] Check this works.
    this.player = new Player(this, playerTiledObject.x!, playerTiledObject.y!) // 100, 350 //this.add.existing(player)

    this.createCoins();

    this.bombs = this.physics.add.group() // [todo] Place according to tilemap.

    this.missileTurretGroup = this.add.group();
    this.missileGroup = this.physics.add.group()

    const tiledObjs = this.map.filterObjects('object-layer', o => o.name === 'missile-turret')
    
    tiledObjs.forEach(tiledObj =>
      this.missileTurretGroup.add(
        new MissileTurret(this, tiledObj.x!, tiledObj.y!)
      )
    )

    this.scoreText  = this.add.text(16,  16, 'score: 0',    {fontSize: '32px', color:'#FFF'})
    this.healthText = this.add.text(250, 16, 'health: 100', {fontSize: '32px', color:'#FFF'})

    //____________Colliders____________//

    this.physics.add.collider(this.player, this.platformLayer)

    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      this.handleCollectCoin,
      undefined,
      this
    )

    this.physics.add.collider(this.bombs, this.platformLayer)
    this.physics.add.collider(this.player, this.bombs, this.player.die, undefined, this.player)

    this.physics.add.collider(
      this.missileGroup, // missileGroup.missiles
      this.platformLayer,
      function(missile: any, platformLayer: any) { // Anonymous function
        missile.destroy(); //missile.kill();
      },
      undefined,
      this
    )

    this.physics.add.collider(
      this.player,
      this.missileGroup, // @ts-ignore
      this.handlePlayerMissileCollide,
      undefined,
      this
    )

    this.physics.add.collider(
      this.missileGroup, // missileGroup.missiles
      this.platformLayer,
      function(missile: any, platformLayer: any) { // Anonymous function
        missile.destroy(); //missile.kill();
      },
      undefined,
      this
    )
  }

  handlePlayerMissileCollide(player: Player, missile: Missile): void {
    missile.destroy();
    player.damage(70);
    this.healthText.setText(`health: ${this.player.health}`)
    this.cameras.main.shake(100, 0.01)
    return
  }

  createPlatforms()
  {
    this.map = this.make.tilemap({key: 'map'}) // this.add.tilemap("map");
    this.map.addTilesetImage("tileset01", "tile-solid");
    this.map.setCollision(1);
    this.platformLayer = this.map.createLayer("solid-layer", "tileset01"); // this.platforms.
  }

  createCoins()
  {
    this.coinGroup = this.physics.add.staticGroup({});
    this.coinGroup.addMultiple( // @ts-ignore https://phaser.discourse.group/t/10239/3
      this.map.createFromObjects('object-layer', {name:'coin', key: 'coin', classType: Coin}) // [todo] Change Layer name in Tiled editor
    )
  }

  private handleCollectCoin(player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject)
  {
    coin.destroy()
    // (coin as Coin).collect
    this.score += (<Coin>coin).value // Unfortunately we need to cast because Phaser won't accept custom types as arguments here...
    this.scoreText?.setText(`score: ${this.score}`)
    // [todo] Add sound fx.
  }

  update()
  {
    if (this.player.health < 1) {
      this.player.die();
      this.physics.pause();
      this.time.addEvent({
        delay: 1500,
        callback: () => this.scene.restart()
      });
    }

    this.inputHandler.update();
    this.player.move(this.inputHandler);

    this.missileTurretGroup.getChildren().forEach(mt => {
      if (this.missileGroup.countActive() < 1) {
        this.missileGroup.add(
          (mt as MissileTurret).fire(this.player.x, this.player.y)
        )
      }
    })

    this.missileGroup.getChildren().forEach(m =>
      (m as Missile).update(this.player.x, this.player.y)
    )
  }

}