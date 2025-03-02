import { Missile } from './missile';
import { GameScene } from '../scenes/game-scene';
import { Player } from './player';

export class MissileTurret extends Phaser.GameObjects.Image {
  missile?: Missile;
  raycaster: Raycaster;
  ray: Raycaster.Ray;
  id: number;
  intersections: Phaser.Geom.Point[];
  delayMs = 100;
  size = 54;

  constructor(scene: GameScene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'missile-turret');
    scene.add.existing(this);
    this.setDisplaySize(this.size, this.size);
    this.id = object.id;
    this.raycaster = scene.raycasterPlugin.createRaycaster({ debug: false });
    this.raycaster.mapGameObjects(scene.player, true);
    this.raycaster.mapGameObjects(scene.solidLayer, false, { collisionTiles: [-1] });

    this.ray = this.raycaster.createRay({
      origin: { x: object.x, y: object.y },
      autoSlice: true,
      enablePhysics: true
      // TODO: Limit field of detection with 'collisionRange' ?
    });

    this.intersections = this.ray.castCircle();

    scene.physics.add.overlap(
      this.ray as any,
      scene.player,
      (ray, player: Player) => {
        this.fire(scene.player.x, scene.player.y, scene.missiles);
      },
      this.ray.processOverlap.bind(this.ray),
      this
    );

    // TODO: Delay firing to match sound with TimerEvent
    // TODO: Delay firing if player nearby
    // TODO: Allow multiple missiles?
    // this.missiles = [];
  }

  fire(initialtargetX: number, initialTargetY: number, missileGroup: Phaser.GameObjects.Group) {
    if (this.missile?.active == true) return;
    this.missile = new Missile(this.scene, this.x, this.y, initialtargetX, initialTargetY);
    missileGroup.add(this.missile);
    this.scene.sound.play('missile-launch', { volume: 0.8 });
  }
}
