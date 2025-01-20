import { Physics } from 'phaser';
import { InputHandler } from '../helpers/InputHandler';
import { Player } from '../objects/Player';
import { Manna } from '../objects/Manna';
import { Missile } from '../objects/Missile';
import { MissileTurret } from '../objects/MissileTurret';
import { Door } from '../objects/Door';
import PhaserRaycaster from 'phaser-raycaster';
import { Key } from '../objects/Key';
import { HealthBar } from '../objects/HealthBar';

export class GameScene extends Phaser.Scene {
  private mapKey: string;
  private map!:                Phaser.Tilemaps.Tilemap;
  private tileset!:            Phaser.Tilemaps.Tileset;
  tileLayerSolids!:            Phaser.Tilemaps.TilemapLayer;
  private objectLayer!:        Phaser.Tilemaps.ObjectLayer;
  private objectShapeLayer:    Phaser.Tilemaps.ObjectLayer;

  raycasterPlugin:             PhaserRaycaster;
  private inputHandler!:       InputHandler;

  private mannaGroup!:         Phaser.Physics.Arcade.StaticGroup;
  private missileTurretGroup!: Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
  missileGroup!:               Phaser.GameObjects.Group; // [old] Phaser.Physics.Arcade.Group;
  private keys!:               Phaser.GameObjects.Group;
  // [todo] private bombs?:     Phaser.Physics.Arcade.Group;

  player!:                     Player;
  private door?:               Door;

  private healthBar:           HealthBar | undefined;

  constructor() {
    super('GameScene');
  }

  init(props: any) { // This gets called on scene.restart(). Before preload() and create().
    //console.log("Init method props: " + props);
    const { mapKey } = props;
    if (mapKey) {
      this.mapKey = mapKey;
    }
    else {
      this.mapKey = 'map2.json';
    }
  }

  create() {
    this.inputHandler = new InputHandler(this);

    // Load map
    //console.log("mapKey: " + this.mapKey);
    this.map = this.make.tilemap({ key: this.mapKey }); // [old] this.add.tilemap("map");
    //console.log("Map: " + this.map);

    // Load tileset
    this.tileset = this.map.addTilesetImage('tileset', 'tileset');

    // Load layers from map
    this.tileLayerSolids  = this.map.createLayer('tile-layer-solids', this.tileset);
    this.objectLayer      = this.map.getObjectLayer('object-layer');
    this.objectShapeLayer = this.map.getObjectLayer('object-layer-shapes');

    // Create groups to hold objects (convenient for handling collisions for all objects of a certain type)
    this.mannaGroup = this.physics.add.staticGroup({});
    this.missileTurretGroup = this.add.group();
    this.missileGroup = this.physics.add.group();
    this.keys = this.physics.add.staticGroup();

    // Instantiate objects for each coordinate in our object layer
    this.objectLayer.objects.forEach((object) => {
      switch (object.name) { // TODO: object.type or object.name?
        case 'manna': {
          this.mannaGroup.add(
            new Manna(this, object)
          );
          break;
        }
        case 'missile-turret': {
          this.missileTurretGroup.add(
            new MissileTurret(this, object)
          );
          break;
        }
        case 'player': {
          this.player = new Player(this, object);
          // [todo] keep player health when change level
          // if (this.player === undefined) ...
          // else
          // this.add.existing(player)
          break;
        }
        case 'door': {
          this.door = new Door(this, object);
          break;
        }
        case 'key': {
          this.keys.add(
            new Key(this, object)
          );
          break;
        }
      }
    });

    this.healthBar = new HealthBar(this, this.player.health);

    // Add colliders
    // This is basically ".setCollisionForAll()". Without it, only the 1st tile from tileset collides.
    this.tileLayerSolids.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, this.tileLayerSolids); // Are both of these needed?

    // [todo] this.physics.add.collider(this.bombs, this.platformLayer)
    // [todo] this.physics.add.collider(this.player, this.bombs, this.player.die, undefined, this.player)

    this.physics.add.collider(
      this.missileGroup, // [old] missileGroup.missiles
      this.tileLayerSolids,
      function(missile: any, platformLayer: any) { // Anonymous function
        missile.explode();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this.player,
      this.missileGroup,
      function(player: Player, missile: Missile): void {
        missile.explode();
        player.damage(70);
        this.healthBar.setLevel(player.health);
        return;
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.mannaGroup,
      (player, manna): void => {
        (manna as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).destroy();
        this.player.health += (manna as Manna).worth;
        this.healthBar.setLevel(this.player.health);
        // TODO: Add sound fx.
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.keys,
      (player, key): void => {
        const door = this.door;
        if ((key as Key).forDoor === door.id) {
          door.open();
          // TODO: Is this still the standard way?
          (key as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).destroy();
        }
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.door, // TODO: Door group
      (player, door): void => {
        if ((door as Door).isOpen) {
          this.scene.restart({ mapKey: (door as Door).leadsTo });
        }
      },
      undefined,
      this
    );

    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        this.player.health -= 1;
        this.healthBar.setLevel(this.player.health);
      },
      callbackScope: this,
      loop: true
    });
  }

  // Update each frame (keep lightweight)
  update() {
    if (this.player?.isDead()) {
      this.endGame();
    }

    this.inputHandler.update();
    this.player.move(this.inputHandler);

    this.missileGroup.getChildren().forEach(m =>
      (m as Missile).update(this.player.x, this.player.y)
    );
  }

  endGame(): void {
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: '48px' })
      .setOrigin(0.5, 0.5);
    this.physics.pause();
    this.time.addEvent({
      delay: 2500,
      callback: () => this.scene.restart()
    });
  }
}
