import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { DB } from '../helpers/database';
import { InputHandler } from '../helpers/input-handler';
import { Player } from '../objects/player';
import { Manna } from '../objects/manna';
import { Missile } from '../objects/missile';
import { MissileTurret } from '../objects/missile-turret';
import { Door } from '../objects/door';
import { Key } from '../objects/key';
import { HealthBar } from '../objects/health-bar';
import { JumpPad } from '../objects/jump-pad';
import { Spike } from '../objects/spike';
import { ExitButton } from '../objects/navigation/exit-button';
import { LaserTurret } from '../objects/laser-turret';
import { explodeGibs } from '../objects/gibs';

export class GameScene extends Phaser.Scene {
  mapKey: string;
  map: Phaser.Tilemaps.Tilemap;
  collisionPlugin: PhaserMatterCollisionPlugin;
  inputHandler: InputHandler;
  player: Player;
  door: Door;
  healthBar: HealthBar | undefined;
  levelStatus: 'PLAYING' | 'COMPLETED' | 'DEAD';

  mannaGroup:     Phaser.GameObjects.Group;
  laserTurrets:   Phaser.GameObjects.Group;
  missileTurrets: Phaser.GameObjects.Group;
  missiles:       Phaser.GameObjects.Group;
  keys:           Phaser.GameObjects.Group;
  jumpPads:       Phaser.GameObjects.Group;
  spikes:         Phaser.GameObjects.Group;

  constructor() {
    super('GameScene');
  }

  // This gets called on scene.restart(). Before preload() and create().
  init(props: { mapKey: string; }) {
    this.mapKey = props.mapKey;
  }

  create() {
    this.levelStatus = 'PLAYING';
    this.map = this.make.tilemap({ key: this.mapKey }); // Load map

    this.matter.world.setBounds(this.map.widthInPixels, this.map.heightInPixels);

    this.add.tileSprite(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2, 'background')
      .setTileScale(1)
      .setDepth(-2)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setAlpha(0.15);

    this.inputHandler = new InputHandler(this);

    this.createSolids();
    this.createGroups();
    this.createObjects();
    this.addColliders();

    this.healthBar = new HealthBar(this, this.player.health);
    const exitButton = new ExitButton(this, 10, 10);
    this.add.existing(exitButton);

    const smoothing = 0.06;
    const yOffset = 45;
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true, smoothing, smoothing * 2, 0, yOffset);

    const healthLossRateInMs = 500;
    this.time.addEvent({
      delay: healthLossRateInMs,
      callback: () => {
        this.player.damage(1);
      },
      callbackScope: this,
      loop: true
    });

    this.cameras.main.fadeIn(850);
  }

  // This runs each frame, so keep it lightweight.
  override update(time: number, delta: number) {
    if (this.inputHandler.escIsFreshlyPressed())
      this.scene.start('MenuScene');

    if (this.levelStatus == 'COMPLETED')
      return;

    if (this.player?.health <= 0 && this.levelStatus != 'DEAD') {
      this.levelStatus = 'DEAD';
      this.collisionPlugin.removeAllCollideListeners();
      this.cameras.main.stopFollow();
      this.player.cleanUp();
      explodeGibs(this, this.player);
      this.time.delayedCall(1500, () => this.cameras.main.fadeOut(700));
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => this.scene.restart({ mapKey: this.mapKey })
      );
      return;
    }

    if (this.levelStatus == 'PLAYING')
      this.player.move(time, delta);

    this.missileTurrets.getChildren().forEach(m =>
      (m as MissileTurret).update(this, this.player, this.missiles));

    this.missiles.getChildren().forEach(m =>
      (m as Missile).update(this.player));

    this.laserTurrets.getChildren().forEach(lt =>
      (lt as LaserTurret).update(this, this.player));
  }

  completeLevel(newMap: string) {
    this.levelStatus = 'COMPLETED';
    this.sound.stopAll();
    this.player.cleanUp();
    this.matter.pause();
    //this.scene.pause();
    DB.unlockLevel(newMap);
    this.cameras.main.fadeOut(1200);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => this.scene.restart({ mapKey: newMap })
    );
  }

  createSolids() {
    const solidLayer = this.map.getObjectLayer('solid-layer');
    solidLayer.objects.forEach((shape) => {
      const graphics = this.add.graphics({ fillStyle: { color: 0x002838, alpha: 1 } });
      if (shape.rectangle) {
        graphics.fillRect(shape.x, shape.y, shape.width, shape.height);
        this.matter.add.rectangle(
          shape.x + (shape.width / 2),
          shape.y + (shape.height / 2),
          shape.width,
          shape.height,
          { isStatic: true }
        );
      }
      if (shape.polygon) {
        const points = shape.polygon;
        graphics.beginPath();
        for (let i = 0; i < points.length; i++) {
          const x = shape.x + points[i].x;
          const y = shape.y + points[i].y;
          if (i == 0)
            graphics.moveTo(x, y);
          else
            graphics.lineTo(x, y);
        }
        graphics.closePath();
        graphics.fillPath();

        const offset = this.matter.vertices.centre(points);
        this.matter.add.fromVertices(
          shape.x + offset.x,
          shape.y + offset.y,
          points,
          { isStatic: true }
        );
      }
    });
  }

  createGroups() {
    this.mannaGroup = this.add.group();
    this.jumpPads = this.add.group();
    this.missileTurrets = this.add.group();
    this.laserTurrets = this.add.group();
    this.missiles = this.add.group();
    this.keys = this.add.group();
    this.spikes = this.add.group();
  }

  createObjects() {
    const objectLayer = this.map.getObjectLayer('object-layer');
    objectLayer.objects.forEach((object) => {
      switch (object.name) {
        case 'player': {
          this.player = new Player(this, object, this.inputHandler);
          break;
        }
        case 'manna': {
          this.mannaGroup.add(
            new Manna(this, object)
          );
          break;
        }
        case 'missile-turret': {
          this.missileTurrets.add(
            new MissileTurret(this, object)
          );
          break;
        }
        case 'laser-turret': {
          this.laserTurrets.add(
            new LaserTurret(this, object)
          );
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
    // TODO: Missile collisions should be moved to here.

    this.collisionPlugin.addOnCollideStart({
      objectA: this.player.sprite,
      objectB: this.mannaGroup.getChildren(),
      callback: (event) => {
        const manna = event.gameObjectB as Manna;
        manna.collect(this.player, this.healthBar);
      }
    });

    this.collisionPlugin.addOnCollideStart({
      objectA: this.player.sprite,
      objectB: this.keys.getChildren(),
      callback: (event) => {
        const key = event.gameObjectB as Key;
        key.collect(this.door);
      }
    });

    this.collisionPlugin.addOnCollideStart({
      objectA: this.player.sprite,
      objectB: this.door,
      callback: (event) => {
        const door = event.gameObjectB as Door;
        if (!door.isOpen) return;
        this.completeLevel(door.leadsTo);
      }
    });

    this.collisionPlugin.addOnCollideStart({
      objectA: this.player.sprite, // TODO: Can player inherit from sprite so we can just say this.player?
      objectB: this.jumpPads.getChildren(),
      callback: (event) => {
        const jumpPad = event.gameObjectB as JumpPad;
        const newVel = jumpPad.trigger();
        if (!newVel) return;
        this.player.hitJumpPad(newVel);
      }
    });

    this.collisionPlugin.addOnCollideStart({
      objectA: this.player.sprite,
      objectB: this.spikes.getChildren(),
      callback: (event) => {
        const spike = event.gameObjectB as Spike;
        this.player.damage(spike.damage);
      }
    });
  }
}
