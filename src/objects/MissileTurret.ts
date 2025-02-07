import { Missile } from './Missile';
import { GameScene } from '../scenes/GameScene';
import { Player } from './Player';

export class MissileTurret extends Phaser.GameObjects.Image {
  missile?: Missile;
  raycaster: Raycaster;
  ray: Raycaster.Ray;
  id: number;
  intersections: Phaser.Geom.Point[];
  delay = 100; // ms
  size = 50;

  constructor(scene: GameScene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'missile-turret');
    this.id = object.id;
    scene.add.existing(this);
    this.setDisplaySize(this.size, this.size);

    // [todo] Delay firing to match sound
    // new Phaser.Time.TimerEvent(
    //     {delay: 100, repeat: 20}
    // )

    // [idea] Allow multiple missiles
    // this.missiles = [];

    this.raycaster = scene.raycasterPlugin.createRaycaster({ debug: false });
    this.raycaster.mapGameObjects(scene.player, true);
    this.raycaster.mapGameObjects(scene.solidLayer, false, { collisionTiles: [-1] });

    this.ray = this.raycaster.createRay({
      origin: { x: object.x, y: object.y },
      autoSlice: true,
      enablePhysics: true
      //collisionRange: TODO: field of view
    });

    this.intersections = this.ray.castCircle();

    scene.physics.add.overlap(
      this.ray as any,
      scene.player,
      (ray, player: Player) => {
        this.fire(scene.player.x, scene.player.y, scene.missileGroup);
      },
      this.ray.processOverlap.bind(this.ray),
      this
    );
  }

  fire(initialtargetX: number, initialTargetY: number, missileGroup: Phaser.GameObjects.Group) {
    if (this.missile?.active !== true) {
      this.missile = new Missile(this.scene, this.x, this.y, initialtargetX, initialTargetY);
      missileGroup.add(this.missile);
      this.scene.sound.play('missile-launch', { volume: 0.8 });
    }
    // [dbg] console.log("firing missile")
    // [todo] play sound, then wait a bit before firing
    // [idea] this.missiles.push(...
    // [old] return this.missile
  }

  // [idea] canSeePlayer(player) {}
}
