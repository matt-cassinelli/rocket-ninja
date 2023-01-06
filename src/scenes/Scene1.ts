import { Physics } from "phaser"
import { InputHandler } from "../helpers/InputHandler"
import { Player } from '../objects/Player'
import { Coin } from '../objects/Coin'
import { Missile } from '../objects/Missile'
import { MissileTurret } from '../objects/MissileTurret'
import { Door } from "../objects/Door"

export class Scene1 extends Phaser.Scene
{
  private mapKey:               string;
  private map!:                 Phaser.Tilemaps.Tilemap;
  private tileset!:             Phaser.Tilemaps.Tileset;
  private tileLayerSolids!:     Phaser.Tilemaps.TilemapLayer;
  private tileLayerBackground!: Phaser.Tilemaps.TilemapLayer;
  private objectLayer!:         Phaser.Tilemaps.ObjectLayer;

  private inputHandler!:        InputHandler;
  
  private coinGroup!:           Phaser.Physics.Arcade.StaticGroup;
  private missileTurretGroup!:  Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
  private missileGroup!:        Phaser.GameObjects.Group; // [old] Phaser.Physics.Arcade.Group;
  // [todo] private bombs?:     Phaser.Physics.Arcade.Group;

  private player!:              Player;
  private door?:                Door;

  private score:                number = 0;
  private scoreText?:           Phaser.GameObjects.Text;
  private healthText!:          Phaser.GameObjects.Text;

  constructor() {
    super('Scene1')
  }

  init(props: any) // This gets called on scene.restart(). Called before preload() and create().
  {
    console.log("Init method props: ");
    console.log(props);
    const { mapKey } = props;
    if (mapKey) {
      this.mapKey = mapKey;
    } else {
      this.mapKey = 'map2.json';
    }
  }

  create()
  {
    this.inputHandler = new InputHandler(this);

    // Load map
    console.log("mapKey: " + this.mapKey);
    this.map = this.make.tilemap({key: this.mapKey}) // [old] this.add.tilemap("map");
    console.log("Map: ");
    console.log(this.map);

    // Load tileset
    this.tileset = this.map.addTilesetImage('tileset', 'tileset');

    // Load layers from map
    this.tileLayerSolids = this.map.createLayer('tile-layer-solids', this.tileset); // [old] this.platforms.
    this.tileLayerBackground = this.map.createLayer('tile-layer-background', this.tileset);
    this.objectLayer = this.map.getObjectLayer('object-layer');

    // Create groups to hold objects. This is convenient for handling collisions for all objects of a certain type.
    this.coinGroup = this.physics.add.staticGroup({});
    this.missileTurretGroup = this.add.group();
    this.missileGroup = this.physics.add.group();

    // Instantiate objects for each coordinate in our object layer
    this.objectLayer.objects.forEach((object) => {
      // [dbg]console.log(object)

      if (object.name === 'coin') {
        this.coinGroup.add(
          new Coin(this, object.x, object.y)
        )
      }

      if (object.name === 'missile-turret') {
        // [dbg] console.log(object);
        this.missileTurretGroup.add(
          new MissileTurret(this, object.x, object.y)
        )
      }

      if (object.name === 'player') {
        this.player = new Player(this, object.x, object.y) // [old] 100, 350 // [idea] this.add.existing(player)
      }

      if (object.name === 'door') {
        // console.log(object);
        this.door = new Door(this, object);
      }

    })

    // Door implementation
    // [old] this.map.addTilesetImage("door", "door");
    // [old] const doorTiledObj = this.map.filterObjects('object-layer', o => o.name === 'door')
    // [old] const door = this.map.createFromObjects('object-layer', {name:'door'})
    // [idea] this.physics.add.collider(this.player, door)
    // [idea] this.objectLayer = this.map.createLayer('object-layer', this.tileset);

    this.scoreText  = this.add.text(16,  16, 'score: 0',    {fontSize: '32px', color:'#FFF'})
    this.healthText = this.add.text(250, 16, 'health: 100', {fontSize: '32px', color:'#FFF'})

    // this.missileTurretGroup.getChildren().forEach(mt => {
    //   if ( !(mt as MissileTurret).missile ) {
    //     (mt as MissileTurret).fire(this.player.x, this.player.y, this.missileGroup);
    //   }
    // })


    //____________Add colliders____________//

    this.tileLayerSolids.setCollisionByExclusion([-1]); // This is basically ".setCollisionForAll()". Without it, only the 1st tile from tileset collides.
    this.physics.add.collider(this.player, this.tileLayerSolids) // Are both of these needed?

    // [todo] this.physics.add.collider(this.bombs, this.platformLayer)
    // [todo] this.physics.add.collider(this.player, this.bombs, this.player.die, undefined, this.player)

    this.physics.add.collider(
      this.missileGroup, // [old] missileGroup.missiles
      this.tileLayerSolids,
      function(missile: any, platformLayer: any) { // Anonymous function
        missile.destroy();
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
        this.healthText.setText(`health: ${this.player.health}`);
        this.cameras.main.shake(100, 0.01);
        return;
      },
      undefined,
      this
    )

    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      function (player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject) {
        coin.destroy() // [old] (coin as Coin).collect
        this.score += (<Coin>coin).value // Unfortunately we need to cast because Phaser won't accept custom types as arguments here.
        this.scoreText?.setText(`score: ${this.score}`)
        // [todo] Add sound fx.
      },
      undefined,
      this
    )

    this.physics.add.overlap(
      this.player,
      this.door,
      function () {
        this.scene.restart({ mapKey: this.door.leadsTo })
      },
      undefined,
      this
    )

    // this.missileTurretGroup.getChildren().forEach(mt =>
    //   (mt as MissileTurret).fire(this.player.x, this.player.y, this.missileGroup)
    // );
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

    //this.missileTurretGroup.getChildren().forEach(mt => {
      // [todo] cast mt as MissileTurret
      //this.missileGroup.children.entries
      //if ( (mt as MissileTurret).missile === undefined ) {
        //console.log('Missile turrets missile before firing:');
        //console.log((mt as MissileTurret).missile);
        //(mt as MissileTurret).fire(this.player.x, this.player.y, this.missileGroup);
        //console.log('Missile turrets missile after firing:');
        //console.log((mt as MissileTurret).missile)
      //}
    //})

    this.missileGroup.getChildren().forEach(m =>
      (m as Missile).update(this.player.x, this.player.y)
    )
  }

}