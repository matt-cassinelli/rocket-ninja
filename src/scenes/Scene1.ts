import { Physics } from "phaser"
import { InputHandler } from "../helpers/InputHandler"
import { Player } from '../objects/Player'
import { Coin } from '../objects/Coin'
import { Missile } from '../objects/Missile'
import { MissileTurret } from '../objects/MissileTurret'

export class Scene1 extends Phaser.Scene
{
  private map!:                 Phaser.Tilemaps.Tilemap;
  private tileset!:             Phaser.Tilemaps.Tileset;
  private tileLayerSolids!:     Phaser.Tilemaps.TilemapLayer;
  private tileLayerBackground!: Phaser.Tilemaps.TilemapLayer;
  // [idea] private objectLayer!: Phaser.Tilemaps.TilemapLayer; // Phaser.Tilemaps.ObjectLayer;

  private inputHandler!:        InputHandler;
  private player!:              Player;
  
  private coinGroup!:           Phaser.Physics.Arcade.StaticGroup;
  // [todo] private bombs?:     Phaser.Physics.Arcade.Group;
  private missileTurretGroup!:  Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
  private missileGroup!:        Phaser.Physics.Arcade.Group;

  private score:                number = 0;
  private scoreText?:           Phaser.GameObjects.Text;
  private healthText!:          Phaser.GameObjects.Text;

  constructor()
  {
    super('Scene1')
  }

  create()
  {
    this.inputHandler = new InputHandler(this);

    // Map & layers
    this.map = this.make.tilemap({key: 'map'}) // [old] this.add.tilemap("map");
    this.tileset = this.map.addTilesetImage('tileset', 'tileset');
    // [dbg] console.log('tilesets', this.tilemap.tilesets);
    // [old] this.map.addTilesetImage('tileset');
    // [old] this.map.addTilesetImage("solids-tileset", "tile-solid");
    // [old] this.map.setCollision(1);

    this.tileLayerSolids = this.map.createLayer('tile-layer-solids', this.tileset); // [old] this.platforms.
    this.tileLayerSolids.setCollisionByExclusion([-1]); // This is basically ".setCollisionForAll()". Without it, only the 1st tile from tileset collides.
    this.tileLayerBackground = this.map.createLayer('tile-layer-background', this.tileset);

    // Door implementation
    // [old] this.map.addTilesetImage("door", "door");
    // [old] const doorTiledObj = this.map.filterObjects('object-layer', o => o.name === 'door')
    // [old] const door = this.map.createFromObjects('object-layer', {name:'door'})
    // [idea] this.physics.add.collider(this.player, door)
    // [idea] this.objectLayer = this.map.createLayer('object-layer', this.tileset);
    
    // Player
    const playerTiledObject: Phaser.Types.Tilemaps.TiledObject =
      this.map.findObject('object-layer', o => o.name === 'player')
    this.player = new Player(this, playerTiledObject.x!, playerTiledObject.y!) // 100, 350 // [idea] this.add.existing(player)

    // Coins
    this.coinGroup = this.physics.add.staticGroup({});
    this.coinGroup.addMultiple( // @ts-ignore https://phaser.discourse.group/t/10239/3
      this.map.createFromObjects('object-layer', {name:'coin', key: 'coin', classType: Coin}) // [todo] Change Layer name in Tiled editor
    )

    // Missiles
    this.missileTurretGroup = this.add.group();
    this.missileGroup = this.physics.add.group()

    const missileTurretTiledObjs = this.map.filterObjects('object-layer', o => o.name === 'missile-turret')
    
    missileTurretTiledObjs.forEach(tiledObj =>
      this.missileTurretGroup.add(
        new MissileTurret(this, tiledObj.x!, tiledObj.y!)
      )
    )

    this.scoreText  = this.add.text(16,  16, 'score: 0',    {fontSize: '32px', color:'#FFF'})
    this.healthText = this.add.text(250, 16, 'health: 100', {fontSize: '32px', color:'#FFF'})

    // [todo] this.bombs = this.physics.add.group() // Place according to tilemap.

    //____________Colliders____________//

    this.physics.add.collider(this.player, this.tileLayerSolids)

    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      function (player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject)
      {
        coin.destroy()
        // [old] (coin as Coin).collect
        this.score += (<Coin>coin).value // Unfortunately we need to cast because Phaser won't accept custom types as arguments here.
        this.scoreText?.setText(`score: ${this.score}`)
        // [todo] Add sound fx.
      },
      undefined,
      this
    )

    // [todo] this.physics.add.collider(this.bombs, this.platformLayer)
    // [todo] this.physics.add.collider(this.player, this.bombs, this.player.die, undefined, this.player)

    this.physics.add.collider(
      this.missileGroup, // [old] missileGroup.missiles
      this.tileLayerSolids,
      function(missile: any, platformLayer: any) { // Anonymous function
        missile.destroy(); // [idea] missile.kill();
      },
      undefined,
      this
    )

    this.physics.add.collider(
      this.player,
      this.missileGroup,
      function (player: Player, missile: Missile): void {
        missile.destroy();
        player.damage(70);
        this.healthText.setText(`health: ${this.player.health}`)
        this.cameras.main.shake(100, 0.01)
        return
      },
      undefined,
      this
    )
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