import { Physics } from 'phaser';
import { InputHandler } from '../helpers/InputHandler';
import { Player } from '../objects/Player';
import { Coin } from '../objects/Coin';
import { Missile } from '../objects/Missile';
import { MissileTurret } from '../objects/MissileTurret';
import { Door } from '../objects/Door';
import PhaserRaycaster from 'phaser-raycaster';
import { Key } from '../objects/Key';

export class GameScene extends Phaser.Scene {
  private mapKey: string;
  private map!:                 Phaser.Tilemaps.Tilemap;
  private tileset!:             Phaser.Tilemaps.Tileset;
  tileLayerSolids!:             Phaser.Tilemaps.TilemapLayer;
  private objectLayer!:         Phaser.Tilemaps.ObjectLayer;
  private objectShapeLayer:     Phaser.Tilemaps.ObjectLayer;

  raycasterPlugin:              PhaserRaycaster;
  private inputHandler!:        InputHandler;

  private coinGroup!:           Phaser.Physics.Arcade.StaticGroup;
  private missileTurretGroup!:  Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
  missileGroup!:                Phaser.GameObjects.Group; // [old] Phaser.Physics.Arcade.Group;
  private keys!: Phaser.GameObjects.Group;
  // [todo] private bombs?:     Phaser.Physics.Arcade.Group;

  player!:                      Player;
  private door?:                Door;

  private gold = 0;
  private goldText?:            Phaser.GameObjects.Text;
  private healthText:           Phaser.GameObjects.Text | undefined;

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
    this.coinGroup = this.physics.add.staticGroup({});
    this.missileTurretGroup = this.add.group();
    this.missileGroup = this.physics.add.group();
    this.keys = this.physics.add.staticGroup();

    // Instantiate objects for each coordinate in our object layer
    this.objectLayer.objects.forEach((object) => {
      switch (object.name) { // TODO: object.type or object.name?
        case 'coin': {
          this.coinGroup.add(
            new Coin(this, object)
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

    const padding = 36;
    this.goldText  = this.add.text(
      this.scale.width - (padding * 2) - 64,
      padding, `${this.gold}`,
      { fontSize: '48px', color: '#f9c810', align: 'right', fixedWidth: 100 }
    );
    this.renderHealth(this.player.health);

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
        this.healthText.setText(`${this.player.health}`);
        return;
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      (player, coin): void => {
        (coin as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).destroy();
        this.gold += (coin as Coin).value; // TODO: Should the player hold this instead?
        this.goldText?.setText(`${this.gold}`);
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
        console.log('Player touched key');
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

    // Timers
    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        this.player.health -= 1;
        this.renderHealth(this.player.health);
      },
      loop: true
    });
  }

  // Update each frame (keep lightweight)
  update() {
    if (this.player.isDead()) {
      this.physics.pause();
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: '48px' })
        .setOrigin(0.5, 0.5);
      this.time.addEvent({
        delay: 2500,
        callback: () => this.scene.restart()
      });
    }

    this.inputHandler.update();
    this.player.move(this.inputHandler);

    this.missileGroup.getChildren().forEach(m =>
      (m as Missile).update(this.player.x, this.player.y)
    );
  }

  renderHealth(value: number): void {
    const padding = 36;
    if (this.healthText) {
      this.healthText.setText(`${value}`);
    }
    else {
      this.healthText = this.add.text(
        padding,
        padding,
        `${value}`,
        { fontSize: '48px', color: '#e41051' }
      );
    }
  }
}
