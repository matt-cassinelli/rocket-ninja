import PhaserRaycaster from 'phaser-raycaster';
import DB from '../helpers/Database';
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
import ExitButton from '../objects/navigation/ExitButton';

export class GameScene extends Phaser.Scene {
  mapKey: string;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  solidLayer: Phaser.Tilemaps.TilemapLayer;
  objectLayer: Phaser.Tilemaps.ObjectLayer;
  raycasterPlugin: PhaserRaycaster;
  inputHandler: InputHandler;
  player: Player;
  door: Door;
  healthBar: HealthBar | undefined;
  isPaused: boolean;

  mannaGroup:         Phaser.Physics.Arcade.StaticGroup;
  missileTurretGroup: Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
  missileGroup:       Phaser.GameObjects.Group; // [old] Phaser.Physics.Arcade.Group;
  keys:               Phaser.GameObjects.Group;
  jumpPads:           Phaser.Physics.Arcade.StaticGroup;
  spikes:             Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('GameScene');
  }

  // This gets called on scene.restart(). Before preload() and create().
  init(props: { mapKey?: string }) {
    // Change this if you want to debug a specific level.
    this.mapKey = props.mapKey ?? 'map1.json';
  }

  create() {
    this.isPaused = false;
    this.map = this.make.tilemap({ key: this.mapKey }); // Load map
    this.tileset = this.map.addTilesetImage('tileset', 'tileset'); // Load tileset

    this.add.tileSprite(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2, 'background')
      .setTileScale(1)
      .setBlendMode('MULTIPLY')
      .setAlpha(0.18);

    // Load layers from map
    this.solidLayer  = this.map.createLayer('tile-layer-solids', this.tileset);
    this.objectLayer = this.map.getObjectLayer('object-layer');

    const exitButton = new ExitButton(this, 10, 10);
    this.add.existing(exitButton);

    this.createGroups();
    this.addObjectsToGroups();
    this.addColliders();

    const smoothing = 0.07;
    const yOffset = 70;
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, false);
    this.cameras.main.startFollow(this.player, true, smoothing, smoothing * 2, 0, yOffset);
    //this.cameras.main.postFX.addVignette(0.5, 0.5, 0.5, 0.5);

    this.inputHandler = new InputHandler(this);
    this.healthBar = new HealthBar(this, this.player.health);

    const healthLossRateInMs = 500;
    this.time.addEvent({
      delay: healthLossRateInMs,
      callback: () => {
        this.player.health -= 1;
        this.healthBar.setLevel(this.player.health);
      },
      callbackScope: this,
      loop: true
    });

    this.cameras.main.fadeIn(850);
  }

  // This runs each frame, so keep it lightweight.
  update() {
    if (this.isPaused == true)
      return;

    if (this.player?.health <= 0) {
      this.killPlayer();
      return;
    }

    this.inputHandler.update();
    if (this.inputHandler.escPressed) {
      this.scene.start('MenuScene');
    }
    this.player.move(this.inputHandler);

    this.missileGroup.getChildren().forEach(m =>
      (m as Missile).update(this.player.x, this.player.y)
    );
  }

  killPlayer() {
    // TODO: Why is * 2 needed?
    this.add.rectangle(0, 0, this.cameras.main.width * 2, this.cameras.main.height * 2, 0xbb0000, 0.2)
      .setBlendMode(Phaser.BlendModes.OVERLAY)
      .setScrollFactor(0);

    this.player.kill();
    this.endMap();
  }

  endMap(newMap?: string) {
    this.isPaused = true;
    this.physics.pause();
    //this.scene.pause();

    DB.unlockLevel(newMap);

    const delay = this.player?.health <= 0 ? 1200 : 0;
    const duration = this.player?.health <= 0 ? 2500 : 1000;
    this.time.delayedCall(
      delay,
      () => this.cameras.main.fadeOut(duration)
    );

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => this.scene.restart({ mapKey: newMap })
    );
  }

  createGroups() {
    this.mannaGroup = this.physics.add.staticGroup({});
    this.jumpPads = this.physics.add.staticGroup();
    this.missileTurretGroup = this.add.group();
    this.missileGroup = this.physics.add.group();
    this.keys = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
  }

  addObjectsToGroups() {
    this.objectLayer.objects.forEach((object) => {
      switch (object.name) {
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
          this.add.text(object.x, object.y, object.text.text, { fontFamily: 'flower',
            fontSize: 22, wordWrap: { width: object.width, useAdvancedWrap: true } })
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
    this.solidLayer.setCollisionByExclusion([-1]); // Without this, only the 1st tile from tileset collides.

    // Fall damage
    this.physics.add.collider(
      this.player,
      this.solidLayer,
      (player: Player, solid) => {
        if (!player.body.blocked.down) // On ground
          return;

        player.damage(200);
        this.healthBar.setLevel(player.health);
      },
      // Only process collision if was falling fast.
      (player: Player, solid) => {
        return player.body.velocity.y > 510;
      }
    );

    // Walking / normal collision.
    this.physics.add.collider(
      this.player,
      this.solidLayer
    );

    this.physics.add.collider(
      this.missileGroup,
      this.solidLayer,
      (missile: Missile, solid) => {
        missile.hitSolid();
      }
    );

    this.physics.add.collider(
      this.player,
      this.missileGroup,
      (player: Player, missile: Missile) => {
        missile.hitPlayer(player, this.healthBar);
      }
    );

    this.physics.add.overlap(
      this.player,
      this.mannaGroup,
      (player: Player, manna: Manna) => {
        manna.collect(player, this.healthBar);
      }
    );

    this.physics.add.overlap(
      this.player,
      this.keys,
      (player: Player, key: Key) => {
        key.collect(this.door);
      }
    );

    this.physics.add.overlap(
      this.player,
      this.door,
      (player: Player, door: Door) => {
        if (!door.isOpen)
          return;

        this.endMap(door.leadsTo);
      }
    );

    this.physics.add.overlap(
      this.player,
      this.jumpPads,
      (player: Player, jumpPad: JumpPad) => {
        jumpPad.trigger(player);
      }
    );

    this.physics.add.overlap(
      this.player,
      this.spikes,
      (player: Player, spike: Spike) => {
        player.damage(spike.damage);
      }
    );
  }
}
