import { GetAngleRadians } from '../helpers/math';
import { GameScene } from '../scenes/game-scene';
import { Player } from './player';

export class LaserTurret extends Phaser.GameObjects.Container {
  private detectionRay: Raycaster.Ray;
  private laserRay: Raycaster.Ray;
  private laser: Phaser.GameObjects.Line;
  private laserIntersections: any;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private timeline: Phaser.Time.Timeline;
  private status: 'IDLE' | 'TRACKING' | 'CHARGING' | 'FIRING';
  private canSeePlayer: boolean;
  private base: Phaser.GameObjects.Image;
  private top: Phaser.GameObjects.Sprite;

  constructor(scene: GameScene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y);
    scene.add.existing(this);

    this.base = scene.add.image(this.x, this.y, 'laser-turret-base')
      .setDisplaySize(54, 54);

    const raycaster = scene.raycasterPlugin.createRaycaster();
    raycaster.mapGameObjects(scene.player, true);
    raycaster.mapGameObjects(scene.solidLayer, false, { collisionTiles: [-1] });
    this.detectionRay = raycaster.createRay({
      origin: { x: object.x, y: object.y },
      autoSlice: true,
      enablePhysics: 'arcade'
    });
    this.detectionRay.castCircle();

    scene.physics.add.overlap(
      this.detectionRay as any,
      scene.player,
      () => this.canSeePlayer = true, // This must be set to false at the end of every update cycle.
      this.detectionRay.processOverlap.bind(this.detectionRay)
    );

    raycaster.removeMappedObjects(scene.player);
    raycaster.mapGameObjects(scene.solidLayer, false, { collisionTiles: [-1] });
    this.laserRay = raycaster.createRay({
      origin: { x: object.x, y: object.y },
      enablePhysics: 'arcade'
    });
    this.laserRay.cast();
    this.laser = scene.add.line();
    this.laser.setOrigin(0, 0);
    this.laser.setStrokeStyle(3, 0xff0000);
    this.laser.postFX.addBloom(0xffffff, 1, 1, 1, 3, 4);
    this.particles = scene.add.particles(0, 0, 'flares', {
      frame: 'red',
      color: [0xffffff, 0xff0000],
      colorEase: 'quint.out',
      lifespan: { min: 100, max: 1000 },
      angle: { min: -140, max: -40 },
      scale: { start: 0.2, end: 0, random: true },
      speed: { min: 80, max: 120 },
      blendMode: 'ADD',
      emitting: false
    });
    //this.add(this.particles);
    //this.add(this.laser);

    this.top = scene.add.sprite(this.x, this.y, 'laser-turret-top')
      .setDisplaySize(54, 54);
    this.top.anims.create({
      key: 'laser-turret-glow',
      frames: scene.anims.generateFrameNumbers('laser-turret-top', { start: 0, end: 10 }),
      frameRate: 7,
      repeat: -1
    });
    this.top.anims.play('laser-turret-glow', true);

    this.timeline = scene.add.timeline([
      {
        at: 0,
        run: () => {
          this.status = 'TRACKING';
          this.laser.setLineWidth(1);
        }
      },
      {
        from: 1500, // Tracking duration
        run: () => {
          this.status = 'CHARGING';
          this.laser.setLineWidth(1);
        }
      },
      {
        from: 1400, // Charging duration
        run: () => {
          this.status = 'FIRING';
          this.laser.setLineWidth(8);
          this.particles.setPosition(this.laserIntersections.x, this.laserIntersections.y);
          this.particles.setRotation(this.laserRay.angle + Phaser.Math.DegToRad(270));
          this.particles.emitting = true;
        }
      },
      {
        from: 1600, // Firing duration
        run: () => {
          this.status = 'IDLE';
          this.laser.setLineWidth(0);
          this.particles.emitting = false;
        }
      }
    ]);
  }

  update(player: Player) {
    if (!this.canSeePlayer) {
      if ((this.status != 'CHARGING' && this.status != 'FIRING') && this.timeline.isPlaying()) {
        this.timeline.stop();
        this.laser.setLineWidth(0);
        this.particles.emitting = false;
      }
      return;
    }

    if (!this.timeline.isPlaying())
      this.timeline.play();

    if (this.status == 'TRACKING') {
      const angle = GetAngleRadians(this.laserRay.origin.x, this.laserRay.origin.y, player.x, player.y);
      this.top.setRotation(angle + Phaser.Math.DegToRad(90));
      this.laserRay.setAngle(angle);
      this.laserIntersections = this.laserRay.cast({ target: new Phaser.Geom.Point(player.x, player.y) });
      this.laser.setTo(this.laserRay.origin.x, this.laserRay.origin.y, this.laserIntersections.x, this.laserIntersections.y);
    }

    if (this.status == 'FIRING') {
      if (Phaser.Geom.Intersects.LineToRectangle(this.laser.geom, player.body))
        player.damage(10);
    }

    this.canSeePlayer = false;
  }
}
