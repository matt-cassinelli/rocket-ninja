import PhaserRaycaster from 'phaser-raycaster';
import { InputHandler } from '../helpers/InputHandler';
import { Player } from '../objects/Player';
import { Manna } from '../objects/Manna';
import { Missile } from '../objects/Missile';
import { MissileTurret } from '../objects/MissileTurret';
import { Door } from '../objects/Door';
import { Key } from '../objects/Key';
import { HealthBar } from '../objects/HealthBar';
import { JumpPad } from '../objects/JumpPad';
import { Spike } from '../objects/Spike';

export class GameScene extends Phaser.Scene {
  mapKey: string;
  map!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  tileLayerSolids!: Phaser.Tilemaps.TilemapLayer;
  objectLayer!: Phaser.Tilemaps.ObjectLayer;
  objectShapeLayer: Phaser.Tilemaps.ObjectLayer;
  raycasterPlugin: PhaserRaycaster;
  inputHandler!: InputHandler;
  player!: Player;
  door?: Door;
  healthBar: HealthBar | undefined;

  mannaGroup!:         Phaser.Physics.Arcade.StaticGroup;
  missileTurretGroup!: Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
  missileGroup!:       Phaser.GameObjects.Group; // [old] Phaser.Physics.Arcade.Group;
  keys!:               Phaser.GameObjects.Group;
  jumpPads:            Phaser.Physics.Arcade.StaticGroup;
  spikes:              Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('GameScene');
  }

  init(props: any) { // This gets called on scene.restart(). Before preload() and create().
    const { mapKey } = props;
    if (mapKey) {
      this.mapKey = mapKey;
    }
    else {
      this.mapKey = 'map1.json';
    }
  }

  create() {
    this.map = this.make.tilemap({ key: this.mapKey }); // Load map
    this.tileset = this.map.addTilesetImage('tileset', 'tileset'); // Load tileset

    // Load layers from map
    this.tileLayerSolids  = this.map.createLayer('tile-layer-solids', this.tileset);
    this.objectLayer      = this.map.getObjectLayer('object-layer');
    this.objectShapeLayer = this.map.getObjectLayer('object-layer-shapes');

    this.createGroups();
    this.addObjectsToGroups();
    this.addColliders();

    const smoothing = 0.07;
    const yOffset = 80;
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, false);
    this.cameras.main.startFollow(this.player, true, smoothing, smoothing, 0, yOffset);

    this.inputHandler = new InputHandler(this);
    this.healthBar = new HealthBar(this, this.player.health);

    const healthLossRateInMs = 1000;
    this.time.addEvent({
      delay: healthLossRateInMs,
      callback: () => {
        this.player.health -= 1;
        this.healthBar.setLevel(this.player.health);
      },
      callbackScope: this,
      loop: true
    });
  }

  update() { // This runs each frame, so keep it lightweight.
    if (this.player?.isDead())
      this.endGame();

    this.inputHandler.update();
    this.player.move(this.inputHandler);

    this.missileGroup.getChildren().forEach(m =>
      (m as Missile).update(this.player.x, this.player.y)
    );
  }

  endGame() {
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: '48px' })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);
    this.physics.pause();
    this.time.addEvent({
      delay: 2500,
      callback: () => this.scene.restart()
    });
  }

  createGroups() {
    this.mannaGroup = this.physics.add.staticGroup({});
    this.jumpPads = this.physics.add.staticGroup();
    this.missileTurretGroup = this.add.group(); // TODO: Could be static?
    this.missileGroup = this.physics.add.group();
    this.keys = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
  }

  addObjectsToGroups() {
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
        case 'jump-pad': {
          this.jumpPads.add(
            new JumpPad(this, object)
          );
          break;
        }
        case 'text': {
          this.add.text(object.x, object.y, object.text.text, { fontSize: '18px' })
            .setDepth(-1);
          break;
        }
        case 'spike': {
          this.spikes.add(
            new Spike(this, object)
          );
          break;
        }
      }
    });
  }

  addColliders() {
    this.tileLayerSolids.setCollisionByExclusion([-1]); // Without this, only the 1st tile from tileset collides.
    this.physics.add.collider(this.player, this.tileLayerSolids);

    this.physics.add.collider(
      this.missileGroup,
      this.tileLayerSolids,
      function(missile: any, platformLayer: any) {
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

    this.physics.add.overlap(
      this.player,
      this.jumpPads,
      (p, jp): void => {
        (jp as JumpPad).trigger(p as Player);
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.spikes,
      (p, s): void => {
        (p as Player).damage((s as Spike).damage);
      },
      undefined,
      this
    );
  }
}
